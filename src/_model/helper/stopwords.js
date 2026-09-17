// ! Need to improve/tune words one time manually
import { stem } from "porter2";


// ? Most of the words are AI generated and emperical.
// ? This stopwords list was also made with references to following:
// * 1. https://github.com/fergiemcdowall/stopword/blob/main/src/stopwords_eng.js
// * 2. https://github.com/NaturalNode/natural/blob/master/lib/natural/util/stopwords.js
// ! This list is "inherently incomplete" due to it being emperical. 
// ! (A better approach would be to actually go through webpages and find top noise words)

export const stopwords = new Set([
  // Articles, Pronouns & Determiners
  'a', 'all', 'another', 'any', 'both', 'each', 'he', 'her', 'here', 'him', 
  'himself', 'his', 'i', 'it', 'me', 'my', 'other', 'our', 'some', 'such', 
  'that', 'the', 'their', 'them', 'these', 'they', 'this', 'those', 'we', 
  'you', 'your',

  // Prepositions & Conjunctions
  'about', 'after', 'and', 'as', 'at', 'because', 'before', 'between', 'but', 
  'by', 'for', 'from', 'if', 'in', 'into', 'of', 'on', 'or', 'out', 'over', 
  'since', 'than', 'through', 'to', 'under', 'up', 'while', 'with',

  // Auxiliary & State Verbs (be, have, do, modals)
  'am', 'are', 'be', 'been', 'being', 'can', 'could', 'did', 'do', 'does', 
  'doing', 'done', 'had', 'has', 'have', 'having', 'is', 'might', 'must', 
  'should', 'was', 'were', 'would',

  // Common Action Verbs & Variations
  'came', 'come', 'get', 'gets', 'getting', 'go', 'goes', 'going', 'gone', 
  'got', 'gotten', 'know', 'look', 'made', 'make', 'makes', 'making', 'said', 
  'see', 'take', 'want', 'went',

  // Contractions & Residues
  'arent', 'cant', 'didnt', 'don', 'dont', 'isnt', 'wasnt', 'werent', 'wont',

  // Adverbs, Question Words & Fillers
  'also', 'even', 'how', 'just', 'more', 'most', 'much', 'never', 'now', 
  'only', 'really', 'same', 'still', 'then', 'there', 'too', 'very', 'way', 
  'well', 'what', 'where', 'which', 'who'
]);



export const noisewords = new Set([
  // Navigation / site chrome
  'home', 'menu', 'navigation', 'nav', 'search', 'sitemap', 'skip', 'toggle',
  'main', 'header', 'footer', 'sidebar', 'breadcrumb', 'back', 'next', 'previous',

  // Cookie / privacy / legal boilerplate
  'cookie', 'cookies', 'privacy', 'policy', 'policies', 'terms', 'conditions',
  'consent', 'gdpr', 'accept', 'decline', 'disclaimer', 'copyright', 'rights',
  'reserved', 'trademark',

  // Login / account
  'login', 'logout', 'signin', 'signup', 'sign', 'register', 'account',
  'profile', 'password', 'username', 'email', 'newsletter',

  // Subscribe / marketing CTAs
  'subscribe', 'subscribed', 'subscription', 'unsubscribe', 'follow',
  'follower', 'like', 'share', 'shared', 'sharing', 'comment', 'comments',
  'reply', 'submit', 'click', 'here', 'link', 'read', 'learn',

  // Social / footer widgets
  'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'pinterest',
  'tiktok', 'social', 'media',

  // E-commerce / ads
  'cart', 'checkout', 'buy', 'shop', 'shopping', 'price', 'sale', 'discount',
  'offer', 'advertisement', 'sponsored', 'promo', 'promotion', 'ad', 'ads',

  // Generic site meta
  'page', 'website', 'site', 'content', 'article', 'blog', 'post', 'posted',
  'author', 'published', 'update', 'updated', 'edit', 'view', 'views',
  'download', 'contact', 'support', 'help', 'faq', 'about',

  // Misc scraping artifacts
  'javascript', 'browser', 'enable', 'disabled', 'loading', 'error',
  'undefined', 'null',
].map(stem));