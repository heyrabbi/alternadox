# Alternadox Press — Deployment Guide

## What's in this folder

```
alternadox-press/
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
├── api/
│   └── checkout.js          # Stripe checkout server function
└── public/
    ├── index.html           # The store
    ├── success.html         # Order confirmation page
    ├── who-even-cares-cover.jpg      ← ADD THIS
    ├── jewish-futurisms-cover.jpg    ← ADD THIS
    └── 50th-gate-cover.jpg          ← ADD THIS
```

---

## Step 1 — Add your book cover images

Save your 3 cover images into the `public/` folder with these exact filenames:
- `who-even-cares-cover.jpg`
- `jewish-futurisms-cover.jpg`
- `50th-gate-cover.jpg`

---

## Step 2 — Add your Stripe Price IDs

1. Go to **Stripe Dashboard → Products**
2. Create a product for each book (or use existing ones)
3. Copy each `price_...` ID
4. Open `public/index.html` and find the `BOOKS` config near the bottom
5. Replace `price_REPLACE_BOOK1`, `price_REPLACE_BOOK2`, `price_REPLACE_BOOK3`

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click **"Add New Project"**
3. Choose **"Upload"** (drag and drop this entire folder)
4. Once deployed, go to **Settings → Environment Variables**
5. Add one variable:
   - Key: `STRIPE_SECRET_KEY`
   - Value: your `sk_live_...` key from Stripe Dashboard → Developers → API Keys

6. Click **Redeploy** after adding the environment variable

---

## Step 4 — Connect your domain

1. In Vercel → your project → **Settings → Domains**
2. Add your domain name
3. Vercel will show you DNS records to add at your domain registrar
4. Usually just two records (A record + CNAME) — your registrar's help docs will walk you through it

---

## Step 5 — Test it

Use Stripe's test mode first:
- Swap your live keys for test keys (`pk_test_...` and `sk_test_...`)
- Use test card number `4242 4242 4242 4242`, any future date, any CVC
- Place a test order end-to-end
- Switch back to live keys when ready

---

## Mailing list

The subscribe form is wired up but needs a destination. 
Popular free options: **Mailchimp**, **ConvertKit**, **Buttondown**.
Each provides a simple API endpoint — drop the URL into the `handleMailingList` 
function in `index.html`.
