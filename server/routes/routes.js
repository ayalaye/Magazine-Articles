
  const express = require('express'),
  articleRoutes = require('./articles');
  
  var router = express.Router();
  
  
  router.post('/articles', articleRoutes.create_article);
  router.put('/articles/:article_id', articleRoutes.update_article);
  router.post('/articles/:article_id/images', articleRoutes.add_image);
  router.get('/articles/:article_id', articleRoutes.read_article);
  router.get('/articles', articleRoutes.read_articles);
  router.delete('/articles/:article_id/images/:image_id', articleRoutes.delete_image);
  router.delete('/articles/:article_id', articleRoutes.delete_article);
  router.get('/unsplashImages/:input/:page_id',articleRoutes.read_unsplash_images);
  
  
  
  module.exports = router;
  
  
  
  