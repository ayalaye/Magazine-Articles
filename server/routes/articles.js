
  var validator = require('validator');

  const fs = require('fs');  
  const { JSDOM } = require('jsdom');
  const { window } = new JSDOM('');
  const $ = require('jquery')(window);
  const dataPath = './server/data/articles.json';
  
  // helper methods
  // readFile - read the article.json file and return the data in the file
  const readFile = (callback, returnJson = false, filePath = dataPath, encoding = 'utf8') => {
      fs.readFile(filePath, encoding, (err, data) => {
              if (err) {
                  console.log(err);
              }
              if (!data) data="{}";
              callback(returnJson ? JSON.parse(data) : data);
         });
  };
  
// writeFile - write to article.json file and saves the data in the file
  const writeFile = (fileData, callback, filePath = dataPath, encoding = 'utf8') => {
  
          fs.writeFile(filePath, fileData, encoding, (err) => {
              if (err) {
                  console.log(err);
              }
  
              callback();
          });
      };
  
  
  module.exports = {
      //READ
      read_articles: function (req, res) {
          fs.readFile(dataPath, 'utf8', (err, data) => {
              if (err) {
                  console.log(err);
                  res.sendStatus(500);                 
              }
              else
                  res.send(!data? JSON.parse("{}") : JSON.parse(data));
          });
      },
  
  
      read_article: function (req, res) {
          fs.readFile(dataPath, 'utf8', (err, data) => {
              if (err) {
                  console.log(err);
                  res.sendStatus(500);
              } else {
                  try {
                      const articles = JSON.parse(data);
                      const article_id = req.params["article_id"];                      
                      if (!article_id || !articles[article_id]) { 
                          return res.sendStatus(404); 
                      } else {
                          res.send(articles[article_id]);
                      }
                  } catch (error) {
                      console.log("Error parsing JSON:", error);
                      res.sendStatus(500);
                  }
              }
          });
      },
      
    // read_unsplash_images - makes the calling to unsplash api in order to get the images
    read_unsplash_images: function (req,res) {
        const clientId = "E6vq27z23ehJproLnRhTtDlY1ilb9Iq2X9ZzWYn7Ouc";
        const perPage = 20; // take 20 images in each calling
        const input = req.params["input"]; // input for search
        const pageId = req.params["page_id"];
        if(!input || !pageId){
            return res.sendStatus(404); 
        }
        const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(input)}&client_id=${clientId}&per_page=${perPage}&page=${pageId}`;

        $.ajax({
            url: apiUrl,
            method: "GET",
            success: function (data) {
                res.send(data);
            },
            error: function (error) {
                console.error("Error fetching images:", error);
                res.sendStatus(500);
            },
        });
    },
    
    // CREATE
    create_article: function (req, res) {

        readFile(data => {

            if(!req.body || !req.body.id ||!req.body.title||!req.body.summary||!req.body.publish_date||!req.body.writer||!req.body.writer.name||!req.body.writer.email||!req.body.writer.mobile_phone){
                return res.status(400).send('one or more fields not complete');  
            }

            const expectedFields = ['id','title', 'summary', 'publish_date', 'writer', 'images'];
            const expectedFieldsInWriter = ['name', 'email', 'mobile_phone','home_phone']
            // Iterate over the properties of req.body to check if there is unexpected field
            for (const field in req.body) {
                if (!expectedFields.includes(field)) {
                    console.warn(`Unexpected field received: ${field}`);
                    return res.status(400).send(`Unexpected field received: ${field}`);
                }
            }

            // Iterate over the properties of req.body.writer to check if there is unexpected field
            for (const field in req.body.writer) {
                if (!expectedFieldsInWriter.includes(field)) {
                    console.warn(`Unexpected field received: ${field}`);
                    return res.status(400).send(`Unexpected field received: ${field}`);
                }
            }

            const pattern_home_phone = /^0(2|3|4|8|9|7[0-9])-[0-9]{7}$/; //  israeli home phone
            const pattern_mobile_phone = /^05[^7]-[0-9]{7}$/ //  israeli mobile phone
            if (data[req.body.id]){
                return res.status(400).send('this id is already exists');
            }
            if(req.body.home_phone && !pattern_home_phone.test(req.body.home_phone)){ // Assuming Israeli home phone numbers

                return res.status(400).send('home phone not valid');
            }
            tempId = req.body.id.replace(/_/g, '');
            tempName = req.body.writer.name.replace(/\s/g, '');

            // check validation
            if(!validator.isAlphanumeric(tempId)||!validator.isAlpha(tempName)|| !pattern_mobile_phone.test(req.body.writer.mobile_phone)||!validator.isDate(req.body.publish_date)){
                return res.status(400).send('one or more fields not valid');
            }
            if(!validator.isEmail(req.body.writer.email)){
                return res.status(400).send('email not valid'); 
            }

            // add the new article
            data[req.body.id] = req.body;
            data[req.body.id].images = {};

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send('new article added');
            });
        },
            true);
    },

    // UPDATE
    update_article: function (req, res) {

        readFile(data => {
           
            const article_id = req.params["article_id"];
            if (!article_id || !data[article_id]) {
                return res.status(404).send("article id not exists")
            } 

            const expectedFields = ['title', 'summary', 'publish_date'];

            // Iterate over the properties of req.body to check if there is unexpected field
            for (const field in req.body) {
                if (!expectedFields.includes(field)) {
                    console.warn(`Unexpected field received: ${field}`);
                    return res.status(400).send(`Unexpected field received: ${field}`);
                }
            }
            // the fields are optionals
            if(req.body.title && !(req.body.title == "")){
                data[article_id].title = req.body.title;
            }
            if(req.body.summary && !(req.body.summary == ""))
                data[article_id].summary = req.body.summary;
            
            if(req.body.publish_date && !(req.body.publish_date == "") ){
                if(!validator.isDate(req.body.publish_date)){
                    return res.status(400).send("date is not valid");
                }
                else{
                    data[article_id].publish_date = req.body.publish_date;
                }
            }

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`article updated`);
            });
        },
            true);  
    },
  
  
    add_image: function (req, res) {
        readFile(data => {
            const article_id = req.params["article_id"];

            if (!article_id || !data[article_id]) {
                return res.status(400).send("articleId not exists");
            } 
            
            if (!data[article_id].images){
                data[article_id].images={}
            } 
            
            if(!req.body || !req.body.thumb || !req.body.description || !req.body.id){
                return res.status(400).send("one or more of the fields not complete");
            }

            // Check if the image already exists
            if(data[article_id].images[req.body.id]) {
                return res.status(400).send("Image already exists.");
            }
            const expectedFields = ['id', 'thumb', 'description'];

            // Iterate over the properties of req.body to check if there is unexpected field
            for (const field in req.body) {
                if (!expectedFields.includes(field)) {
                    console.warn(`Unexpected field received: ${field}`);
                    return res.status(400).send(`Unexpected field received: ${field}`);
                }
            }

            if(!validator.isURL(req.body.thumb)){
                return res.status(400).send("image url not valid");
            } 

            // Create the image object
            const newImage = {
                thumb: req.body.thumb,
                id: req.body.id,
                description: req.body.description
            };
    
            // Add the image to the article
            data[article_id].images[req.body.id] = newImage;
    
            // Write the updated data to file
            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`Added new image with id: ${req.body.id}`);
            });
        }, true);
    },
    


    // DELETE
    delete_article: function (req, res) {

        readFile(data => {

            const article_id = req.params["article_id"];
            if (!article_id || !data[article_id]){
                return res.status(404).send("articleId not exists"); 
            }

            // delete the article
            delete data[article_id];

            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`article id:${article_id} removed`);
            });
        },
            true);
    },

    delete_image: function (req, res) {

        readFile(data => {

            const image_id = req.params["image_id"];
            const article_id = req.params["article_id"];
            if (!article_id || !data[article_id] ){
                return res.status(404).send("articleId not exists"); 
            } 
            if(!image_id || !data[article_id].images || !data[article_id].images[image_id] ){
                return res.status(404).send("image not valid"); 
            }
            
            // delete the image
            delete data[article_id].images[image_id];
            writeFile(JSON.stringify(data, null, 2), () => {
                res.status(200).send(`image id:${image_id} removed`);
            });
        },
            true);
    }
  };
  
  
  
  
  
  
  
  
  