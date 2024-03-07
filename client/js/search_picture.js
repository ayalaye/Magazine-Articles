  
  let pageId = 0;
  currentImages = []
  
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('articleId');
  console.log("search_picture_param: ",articleId);
  
  $(document).ready(function () {
      $("#btn_load_more").hide();
  
      // Add input event listener
      $("#search_input").on("input", function () {
          if ($("#popup").length) {
              closePopup();
          }
          const input = $(this).val();
          if (input.length >= 2) {
              pageId = 0; 
              fetchImages(input);
          }else{
              $(".gallery").empty();
              $("#btn_load_more").hide();
          }
      });
  });
  
  //fetchImages- make the call ajax and show the btn load more if need and the pictures, get input to search, no return value
  function fetchImages(input) {
    var encodedInput = encodeURIComponent(input);

      $.ajax({
          url: '/unsplashImages/'+ encodedInput +'/'+pageId,
          method: "GET",
          success: function (data) {
              console.log(data);
              displayImages(data.results);
              if (pageId < data.total_pages - 1) {
                  $("#btn_load_more").show();
              } else {
                  $("#btn_load_more").hide();
              }
          },
          error: function (error) {
              console.error("Error fetching images:", error);
          },
      });
  }
  
  //displayImages- show the pictures 4 pictures in line, get the images, no return value
  function displayImages(images) {
          const gallery = $(".gallery");
          gallery.empty();
      
          const images_per_row = 4;
          const total_images = images.length;
      
          for (let i = 0; i < total_images; i += images_per_row) {
              const row_images = images.slice(i, i + images_per_row);
      
              const row_element = $("<div class='image_row'></div>");
      
              row_images.forEach((image) => {
                console.log("imageId", image.id)
                  const photo_element = `
                      <div class="photo">
                          <img src="${image.urls.thumb}" class="image_item" data-image-id="${image.id}">
                          <button onclick="addImage('${image.id}')" class="add_btn">Add image to article</button>
  
                      </div>
                  `;
                  row_element.append(photo_element);
              });
              //if in the last line there less 4 picture show still show the thumb picture
              if (i + images_per_row > total_images) {
                  const placeholdersCount = i + images_per_row - total_images;
                  for (let j = 0; j < placeholdersCount; j++) {
                      const placeholder_element = `
                          <div class="photo placeholder"></div>
                      `;
                      row_element.append(placeholder_element);
                  }
              }
              gallery.append(row_element);
          }
          currentImages = images;

  }
  
  //loadMore show the next page of the pictures, no parameters, no return value
  function loadMore() {
       if ($("#popup").length) {
          closePopup();
      }
      pageId++;
      const input = $("#search_input").val();
      fetchImages(input);
      
  }
  
  //addImage- check which picture to show popup and show it, get the image id, no return value
  function addImage(imageId) {
      const image = currentImages.find((img) => img.id === imageId);
      var newImage = {
          thumb: image.urls.thumb,
          description: image.alt_description,
          id: imageId
      };
      $.ajax({
          url: '/articles/' + articleId + '/images',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(newImage),
            
          success: function(response) {
              url = '/list';
              window.location.href = url; // return to the main page
          },
          error: function(xhr, status, error) {
              console.error(error);
          }
      });
  }
  
  
  
  