const blogSupport  = {
    pullSummary: () => {
        // pull and display blog posts
        const baseURL = location.origin;

        fetch(`${baseURL}/api/blog`)
            .then(response => response.json())
            .then(data => {  
            $('.parent_blog-showcase').html('');
            $('.w-dyn-empty').hide();
            data.forEach(post => {
                $('.parent_blog-showcase').append(post.html);
            });
        })
        .catch(error => console.error('Error:', error));
    }
}

// launch
$(document).ready(function() {
    blogSupport.pullSummary();
});


