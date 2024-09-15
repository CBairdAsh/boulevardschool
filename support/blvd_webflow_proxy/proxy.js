const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/blog', async (req, res) => {
  try {
    const response = await axios.get(`https://boulevardschool.webflow.io/blog`);

    // NOTE: use for debug only
    //const response = await axios.get('https://dev-boulevardschool.webflow.io/blog');
    
    const html = response.data;
    const $ = cheerio.load(html);

    // Example: Extract blog post titles and links
    const blogPosts = [];
    $('.parent_blog-showcase').each((index, element) => {
      blogPosts.push({ "html": $(element).html() });
    });

    res.json(blogPosts);
  } catch (error) {
    console.error('Error scraping the page:', error);
    res.status(500).send('Error scraping the page');
  }
});

// handle dynamic blog post URLs
app.get('/blog-posts/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const response = await axios.get(`https://boulevardschool.webflow.io/blog-posts/${slug}`);

    // NOTE: use for debug only
    //const response = await axios.get(`https://dev-boulevardschool.webflow.io/blog-posts/${slug}`);

    const html = response.data;

    const $ = cheerio.load(html);

    fs.readFile(path.join(__dirname, '', 'footer.html'), 'utf8', (err, template) => {
      if (err) {
        console.error('Error reading the template file:', err);
        res.status(500).send('Error reading the template file');
        return;
      }

      $('.footer').html(template);

      // Extract the content you need from the page
      let content = $('html').html();

      // set root to site path
      const rootUrl = '';

      // NOTE: use for debug only
      //const rootUrl = '/boulevardschool';

      // adjusting as needed so final page uses off-Webflow site
      //content = content.replace(/href="\/"/ig,`href="/index"`);

      // fully quality path, will adjust index from previous line
      //content = content.replace(/href="\/([^"]+?)"/ig,`href="${rootUrl}/$1.html"`);
      //content = content.replace(/src="\/images/ig,`src="${rootUrl}/images`);   

      // Render the content in your local site
      res.send(`${content}`);
    });
  } catch (error) {
    console.error('Error fetching the blog post:', error);
    res.status(500).send('Error fetching the blog post');
  }
});

app.listen(PORT, () => {
  //console.log(`Server is running on port ${PORT}`);
});
