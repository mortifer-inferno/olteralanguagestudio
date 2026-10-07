# Oltera Language Studio website

    oltera/
      index.html          page structure
      css/style.css      all styling (charcoal and white theme)
      js/app.js (data section at the top)          content: countries, FAQs, steps, stories. Edit this first.
      js/practice.js      reading mock test and writing check
      js/main.js          builds the page from data.js and runs the GSAP scroll animation
      assets/emblem.svg   logo emblem
      js/chat.js          floating assistant widget
      server/server.js    Express backend: stores enquiries and powers the AI assistant
      package.json

## Run it
    npm install
    ADMIN_TOKEN=choose-a-secret npm start     # http://localhost:3000

Enquiries are saved to server/data/enquiries.json. Read them with
`curl -H "x-admin-token: choose-a-secret" localhost:3000/api/enquiries`.
Opening index.html directly also works, but the form then saves on the device only.

## Still to replace
Figures marked "sample" in js/app.js (data section at the top), testimonials, plan prices and the IELTS requirements
(confirm each against the university's own page).

## AI assistant
The "Ask us" chat button answers visitors' questions. With a Claude API key it uses the AI:

    ANTHROPIC_API_KEY=your-key ADMIN_TOKEN=choose-a-secret npm start

(Node 18 or newer. Optional: CLAUDE_MODEL to change the model, default claude-haiku-4-5-20251001.)
It answers from the content in js/app.js (data section at the top), so editing that file updates the assistant too.
Keep the key on the server only, never in the browser files. Without a key, or when index.html is
opened directly, the chat still works by answering from data.js with simple matching.