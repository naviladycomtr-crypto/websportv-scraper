const axios = require('axios');

// Configurations for your active local development structure
const WP_DOMAIN = "http://norecoiltr.local";
const FLUSH_URL = `${WP_DOMAIN}/wp-json/websportv/v1/flush-matches`;
const INSERT_URL = `${WP_DOMAIN}/wp-json/wp/v2/mac_rehberi`;

// High-availability open source live sports stream network feed
const DATA_FEED_SOURCE = "https://raw.githubusercontent.com/bariscodefx/sport-tv-guide-api/main/guide.json";

async function executeCloudScraperPipeline() {
    console.log("Starting automated cloud scraper sync...");

    try {
        // Step 1: Securely hit the flush endpoint to clear out yesterday's stale matches
        const flushResponse = await axios.get(FLUSH_URL, { timeout: 10000 });
        console.log(`Database clear hook executed successfully:`, flushResponse.data);

        // Step 2: Fetch raw real-time listings from the centralized target data pool
        const feedResponse = await axios.get(DATA_FEED_SOURCE, { timeout: 12000 });
        const rawItems = feedResponse.data;

        if (!rawItems || !Array.isArray(rawItems)) {
            console.log("Data feed source is currently empty or down. Sleeping until next schedule.");
            return;
        }

        // Step 3: Loop through, validate and pipe accurate matches into WordPress CPT tables
        for (const item of rawItems) {
            if (!item.team_a || !item.team_b) continue;

            const matchTitle = `${item.team_a} - ${item.team_b}`;
            const matchLeague = item.league || "Canlı Spor Müsabakası";
            const matchTime = item.time || "00:00";
            const matchChannel = item.channel || "TRT Spor / S Sport";
            const matchUrl = item.url || "https://www.trtizle.com";

            // Generate full word analysis content context to keep AdSense crawler perfectly satisfied
            const dynamicSEOBody = `<h2>${matchTitle} Maçı Canlı İzle Şifresiz Rehberi</h2>` +
                `<p>Ekran başındaki spor tutkunlarının büyük bir merakla beklediği ${matchLeague} organizasyonunda bugün ${item.team_a} ve ${item.team_b} ekipleri yeşil sahada karşı karşıya geliyor. Yayında kalma ve organik trafiği tetikleyecek olan bu dev müsabaka haftanın en kritik maçları arasında.</p>` +
                `<h2>Maç Saat Kaçta ve Hangi Resmi Kanalda?</h2>` +
                `<p>Zorlu karşılaşma bugün tam olarak saat ${matchTime} itibarıyla başlayacak olup, resmi yayıncı ${matchChannel} ekranlarından şifresiz ve canlı olarak izlenebilecektir. Canlı yayın akış bağlantılarına sitemiz üzerinden yasal olarak ulaşabilirsiniz. İyi seyirler dileriz.</p>`;

            const payload = {
                title: matchTitle,
                content: dynamicSEOBody,
                status: "publish",
                meta: {
                    ws_match_time: matchTime,
                    ws_match_league: matchLeague,
                    ws_match_channel: matchChannel,
                    ws_match_legal_url: matchUrl
                }
            };

            try {
                const postReq = await axios.post(INSERT_URL, payload, {
                    headers: { 'Content-Type': 'application/json' }
                });
                if (postReq.status === 201) {
                    console.log(`Successfully Synchronized: ${matchTitle} [${matchTime}] via Cloud API.`);
                }
            } catch (err) {
                console.log(`Error writing item to WordPress tables: ${matchTitle}`);
            }
        }
        console.log("Cloud automation sequence successfully completed.");
    } catch (globalError) {
        console.error("Critical automation loop error:", globalError.message);
    }
}

// Fire the pipeline execution
executeCloudScraperPipeline();
