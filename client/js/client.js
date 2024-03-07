var ascending = true; // Set default sorting order to descending

$(document).ready(function() {
    var articleId
    
    $("form[name='add-form']").validate({
      // Specify validation rules
      rules: {
          "id": {
              required: true,
              pattern: /^[a-zA-Z0-9_]+$/              
          },
          "title": {
              required: true
          },
          "summary": {
              required: true
          },
          "writer-name": {
              required: true,
              pattern: /^[a-zA-Z\s]+$/,
          },
          "writer-email": {
              required: true,
              email: true
          },
          "writer-mobile-phone": {
              required: true,
              pattern: /^05[^7]-[0-9]{7}$/, // Custom rule for Israeli cell phone numbers

          },
          "writer-home-phone": {
              pattern: /^0(2|3|4|8|9|7[0-9])-[0-9]{7}$/ // Custom rule for Israeli home phone numbers
          },
          "publish-date": {
              required: true,
              date: true 
          }
      },
      messages: {
          id: {
              required: "Please enter an ID.",
              pattern: "Please enter only letters, digits, or underscores.",
          },
          title: {
              required: "Please enter a title."
          },
          summary: {
              required: "Please enter a summary."
          },
          "writer-name": {
              required: "Please enter the writer's name.",
              pattern: "Please enter only letters and spaces."
          },
          "writer-email": {
              required: "Please enter a valid email address.",
              email: "Please enter a valid email address."
          },
          "writer-mobile-phone": {
              required: "Please enter a valid mobile phone number.",
              pattern: "Please enter a cell phone number xxx-xxxxxxx"
          },
          "writer-home-phone": {
              pattern: "Please enter a home phone number. xx-xxxxxxx"
          },
          "publish-date": {
              required: "Please enter a publish date.",
              date: "Please enter a valid date."
          }
      }
    });
    $("form[name='update-form']").validate({
      // Specify validation rules
      rules: {
          "publish-date": {
              date: true
          }
      },
      messages: {
          "publish-date": {
              date: "Please enter a valid date."
          }
      }
    });

    // fetchArticleList - Function to fetch and display article list in a table, no parameters, no return value
    function fetchArticleList() {
        $.ajax({
            url: '/articles',
            method: 'GET',
            success: function(data) {
                // Clear existing table rows
                $('#article-table-body').empty();
                // Populate table with articles
                Object.keys(data).forEach(function(articleId) {
                    var article = data[articleId];
                    var row = $('<tr>');
                    row.append('<td>' + article.id + '</td>');
                    row.append('<td>' + article.title + '</td>');
                    row.append('<td>' + article.writer.name + '</td>');
                    row.append('<td>' + article.publish_date + '</td>');
                    // Add action buttons
                    var actions = $('<td>');
                    actions.append('<button class="delete-article-btn" data-article-id="' + article.id + '">Delete</button>');
                    actions.append('<button class="update-article-btn" data-article-id="' + article.id + '">Update</button>');
                    actions.append('<button class="add-photo-btn" data-article-id="' + article.id + '">Add Photo</button>');
                    actions.append('<button class="view-photo-list-btn" data-article-id="' + article.id + '">View Photos</button>');
                    row.append(actions);
                    $('#article-table-body').append(row);
                   
                });
                ascending = true; // Set default sorting order to descending according to publish date
                sortTable(3);
            }
        });
    }
  
    // Event listener for add article button
    $('.add-article-btn').click(function() {
      $('#add-article-form').css("display", "block");
    });
  
    // Handle form submission
    $('#add-form').submit(function(event) {
      if(!$("#add-form").valid()) return;
      event.preventDefault(); // Prevent default form submission
      // Collect form data
      var formData = {
          id: $('#id').val(),
          title: $('#title').val(),
          summary: $('#summary').val(),
          writer: {
            name: $('#writer-name').val(),
            email: $('#writer-email').val(),
            mobile_phone: $('#writer-mobile-phone').val(),
            home_phone: $('#writer-home-phone').val()
          },
          images:{
          },
          publish_date: $('#publish-date').val()
      };
  
      // Send form data to server
      $.ajax({
          url: '/articles', 
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(formData),
          success: function(response) {
              // If successful, refresh the article list
              fetchArticleList();
              // Hide the form
              $('#add-article-form').hide();
              // Clear form fields
              $('#add-form')[0].reset();

          },
          error: function(xhr, status, error) {
              alert("Check if the email you enter is valid");
          }
      });
    });
  
    // Close the modal when close button or outside modal area is clicked
    $('.close, .modal').click(function() {

      $('#add-article-form').css("display", "none");
      $('#update-article-form').css("display", "none");
      $('#imageModal').hide();
      $('#add-form')[0].reset();
      $('#update-form')[0].reset();

    });
    
  
    // Prevent modal from closing when modal content is clicked
    $('.modal-content').click(function(event) {
      event.stopPropagation();
    });
  
    // Event listener for deletion button
    $('#article-table-body').on('click', '.delete-article-btn', function() {
        var articleId = $(this).data('article-id');
        deleteArticle(articleId);
    });

    // deleteArticle - Function to handle article deletion, get articleId (string), no return value 
    function deleteArticle(articleId) {
      $.ajax({
          url: '/articles/' + articleId,
          method: 'DELETE',
          success: function() {
              fetchArticleList(); // Refresh article list after deletion
          },
          error: function(xhr, status, error) {
              console.error(error);
          }
      });
    }
  
  
    // Event listener for update button
    $('#article-table-body').on('click', '.update-article-btn', function() {
      articleId = $(this).data('article-id');
      $('#update-article-form').toggle();
    });
  
    // Handle form submission
    $('#update-form').submit(function(event) {
      if(!$("#update-form").valid()) return;
      event.preventDefault(); // Prevent default form submission
  
      // Collect form data
      var formData = {
          title: $('#update-title').val(),
          summary: $('#update-summary').val(),
          publish_date: $('#update-publish-date').val()
      };
  
      // Send form data to server
      $.ajax({
          url: '/articles/' + articleId,
          method: 'PUT',
          contentType: 'application/json',
          data: JSON.stringify(formData),
            
          success: function(response) {
              // If successful, refresh the article list
              fetchArticleList();
              // Hide the form
              $('#update-article-form').hide();
              // Clear form fields
              $('#update-form')[0].reset();

          },
          error: function(xhr, status, error) {
              console.error(error);
          }
      });
    });
  
   
  // Event listener for view photo list button
  $('#article-table-body').on('click', '.view-photo-list-btn', function() {
    articleId = $(this).data('article-id');
    console.log("article id = ",articleId);
    // Make AJAX request to fetch photos associated with the article
    $.ajax({
      url: '/articles/' + articleId,
      method: 'GET',
      success: function(article) {
        // Clear existing images
        $('#imageContainer').empty();
        // Populate the modal with images
        Object.keys(article.images).forEach(function(key) {
          const image = article.images[key];
          const imageItem = $('<div>');
          imageItem.append('<img src="' + image.thumb + '">');
          imageItem.append('<button class="delete-photo-btn" data-photo-id="' + key + '">delete</button>');
          $('#imageContainer').append(imageItem);
        });
            $('#imageModal').show();
      },
      error: function(xhr, status, error) {
        console.error(error);
      }
    });
  });
  
  
  // deleteImage - delete image from article, get imageId, photoDiv, no return value
  function deleteImage(imageId, $photoDiv) {
    var encodedImageId = encodeURIComponent(imageId);
  
    // Make AJAX request to delete the photo
    $.ajax({
      url: '/articles/' + articleId + '/images/' + encodedImageId,
      method: 'DELETE',
      success: function() {
        // Remove the deleted photo and its associated button from the popup/modal
        $photoDiv.remove();
      },
      error: function(xhr, status, error) {
        console.error(error);
      }
    });
  }

  // listener
  $('#imageContainer').on('click', '.delete-photo-btn', function() {
    var $photoDiv = $(this).parent();
    var imageId = $(this).data('photo-id');
    deleteImage(imageId, $photoDiv);
  });
  

  $('.close').on('click', function() {
    $('#imageModal').hide();
  });
  
  //Event listener for add photo button
  $('#article-table-body').on('click', '.add-photo-btn', function() {
  
    articleId = $(this).data('article-id');
    console.log("#",articleId,encodeURIComponent(articleId));
    // Construct the URL with the articleId parameter
    const url = '/add_photo?articleId=' + encodeURIComponent(articleId); 
    // Navigate to another HTML page with the articleId parameter
    window.location.href = url;
  });
  
    fetchArticleList();

  });
  
  //sortTable - function that sort the table according to columnIndex, 1- title, 3 - publish date, no return value
function sortTable(columnIndex) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("article-table");
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[columnIndex];
            y = rows[i + 1].getElementsByTagName("td")[columnIndex];
            var xValue = x.innerHTML.toLowerCase();
            var yValue = y.innerHTML.toLowerCase();

            // Check if the values are equal
            if (xValue === yValue) {
                continue;
            }

            // Sorting logic based on ascending or descending order
            if (ascending) {
                if (xValue < yValue) { // Changed the comparison for descending order
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (xValue > yValue) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
    ascending = !ascending;
}

  
   
  
  
  
  
  