const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Fetch and display stock data
router.get('/stock', async (req, res) => {
  try {
    const response = await fetch('https://yh-finance.p.rapidapi.com/stock/get-fundamentals?symbol=AMRN&region=US&lang=en-US&modules=assetProfile%2CsummaryProfile%2CfundProfile', {
        headers: {
            'x-rapidapi-key': 'a435a003c8mshbcf2b2f46a52150p113c10jsn483f3ccb1e93',
            'x-rapidapi-host': 'yh-finance.p.rapidapi.com'
          }
    });
    const data = await response.json();
    res.render('api/stock', { stockData: data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching stock data');
  }
});


router.get('/news', async (req, res) => {
    try {
        const apiKey = '658a8464e25141eb9d0b7a407b3d98f5'; 
        const url = 'https://api.worldnewsapi.com/retrieve-front-page?source-country=au&date=2024-07-09&source-name=herald-sun';

        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey
            }
        });

        const data = await response.json();
        console.log('API Response:', data); 
        if (!data.front_page) {
            return res.render('api/news', { frontPage: null }); 
        }

        res.render('api/news', { frontPage: data.front_page }); 
    } catch (error) {
        console.error('Error fetching news data:', error);
        res.render('api/news', { frontPage: null }); 
    }
});


  

module.exports = router;
