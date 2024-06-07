const {DataAPIClient, ObjectId} = require("@datastax/astra-db-ts");
const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");
const {createInterface} = require("readline");

class BatchProcessor {
  constructor(astraToken, astraEndpoint, openaiApiKey, nftStorageToken) {
    this.openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    this.client = new DataAPIClient(astraToken);
    this.db = this.client.db(astraEndpoint);
    this.commentBatchId = null;
    this.createCommentsPrompt = `You need to find something a historical figure once said to respond. We hope to make people feel that part of life is living in the present, while another part is living in the past. Please use JSON for the response, with the 'user' field representing the person's name and the 'text' field representing the specific quote. For example: { 'user': 'Vincent van Gogh', 'text': 'Great things are done by a series of small things brought together.' }`
  }
  
  setCommentBatchId(batchId) {
    this.commentBatchId = batchId
  }
  
  async retrieveBatchComments(batchId) {
    const batch = await this.openai.batches.retrieve(batchId);
    if (batch.status !== "completed") {
      console.log("Not completed yet");
      return;
    }
    console.log("total:", batch.request_counts.total, " completed", batch.request_counts.completed);
    if (batch.request_counts.completed > 0) {
      const output_file = await this.openai.files.content(batch.output_file_id);
      const bufferView = new Uint8Array(await output_file.arrayBuffer());
      const filePath = path.join(__dirname, "batchCommentsOutput.jsonl");
      fs.writeFileSync(filePath, bufferView);
      console.log("batchCommentsOutput.jsonl was saved");
      
      const rl = createInterface({
        input: fs.createReadStream(filePath),
      });
      
      for await (const line of rl) {
        const {custom_id, response} = JSON.parse(line);
        const content = response.body.choices[0].message.content;
        const {user, text} = JSON.parse(content);
        
        // todo: add comments to events
        
        console.log(result)
      }
    }
  }
  
  async createBatchComments() {
    const data = await this.db.collection("events").find({
      parent_post_id: {
        $exists: false,
      },
    }, {
      limit: 1000,
      projection: {
        text: 1,
      }
    }).toArray();
    
    let jsonlString = "";
    
    for (const post of data) {
      const comments = await this.db.collection("events").find({
        parent_post_id: new ObjectId(post._id.toString()),
      }, {
        limit: 10,
        sort: {updatedAt: -1},
        projection: {
          $vector: 0,
        }
      }).toArray();
      
      if (comments.length > 10) {
        break;
      }
      
      const commentsString = comments?.map(post => `${post.user}: "${post.text}"`).join(";") || "";
      jsonlString += JSON.stringify({
        custom_id: post._id.toString(),
        method: "POST",
        url: "/v1/chat/completions",
        body: {
          model: "gpt-4o",
          response_format: {type: "json_object"},
          messages: [
            {
              role: "system",
              content: this.createCommentsPrompt,
            },
            {
              role: "user",
              content: `正文：${post.text}`,
            },
            {
              role: "user",
              content: `已有评论：${commentsString}，请不要与现有的评论重复。`
            },
          ],
          max_tokens: 4096,
        },
      }) + "\n";
    }
    
    const filePath = path.join(__dirname, 'batchCommentsInput.jsonl');
    
    try {
      fs.writeFileSync(filePath, jsonlString + '\n');
    } catch (e) {
      console.error('写入文件时出错:', e);
      return;
    }
    console.log('字符串已成功写入文件.');
    
    const file = await this.openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: "batch",
    });
    
    const batch = await this.openai.batches.create({
      input_file_id: file.id,
      endpoint: "/v1/chat/completions",
      completion_window: "24h"
    });
    
    console.log("Batch id:", batch.id);
    
    this.entityBatchId = batch.id;
  }
  
  async runCreateCommentsOnce () {
    if (this.commentBatchId) {
      await this.retrieveBatchComments(this.commentBatchId);
      this.commentBatchId = null;
    } else {
      await this.createBatchComments();
    }
  }
  
  async runCreateCommentsContinuously () {
    while (true) {
      await this.runCreateCommentsOnce();
      console.log('等待 30m');
      await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000));
    }
  }
  
  async deleteAll () {
    const result = await this.db.collection("events").deleteAll({})
    console.log(result);
  }
}