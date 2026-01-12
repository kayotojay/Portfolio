const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/proxy-docx", async (req, res) => {
  const fileUrl = req.query.url;
  const response = await fetch(fileUrl);
  const buffer = await response.arrayBuffer();
  res.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.send(Buffer.from(buffer));
});

app.listen(3000);
