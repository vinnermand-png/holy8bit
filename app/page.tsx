import Header from "../components/Header";
import Artwork from "../components/Artwork";
import SiteFooter from "../components/SiteFooter";
import { archive, stories, themes } from "../content/home";

function ArrowLink({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return <a className="text-link" href={href}>{children} <span aria-hidden="true">→</span></a>;
}

export default function Home() {
  return <div id="top"><a className="skip-link" href="#main-content">Skip to content</a>
    <Header />
    <main id="main-content">
      <section className="hero" aria-labelledby="hero-title"><div className="hero-art" aria-hidden="true" /><div className="wrap hero-content"><p className="eyebrow">SCRIPTURE IN PIXELS</p><h1 id="hero-title">HOLY8BIT</h1><p className="hero-description">Biblical stories and Scripture through cinematic pixel art.</p><div className="hero-actions"><a className="button" href="#scripture">EXPLORE SCRIPTURE <span aria-hidden="true">→</span></a><ArrowLink href="#stories">DISCOVER STORIES</ArrowLink></div><p className="hero-motto">PIXEL IS THE MEDIUM. CHRIST IS THE CENTER.</p></div></section>

      <section className="featured" id="scripture" aria-labelledby="featured-title"><div className="wrap featured-grid"><div><p className="eyebrow">FEATURED SCRIPTURE</p><h2 className="quote serif" id="featured-title">“The light shines in the darkness, and the darkness has not overcome it.”</h2><p className="reference">JOHN 1:5</p><a className="button" href="/scripture">EXPLORE JOHN 1 <span aria-hidden="true">→</span></a></div><Artwork className="featured-art" /></div></section>

      <section className="themes" aria-labelledby="themes-title"><div className="wrap"><div className="section-top"><div><p className="eyebrow">EXPLORE SCRIPTURE</p><h2 className="section-heading" id="themes-title">FIND SCRIPTURE FOR WHERE YOU ARE.</h2><p className="section-copy">Explore passages connected to the questions, struggles and seasons of life.</p></div><ArrowLink href="/scripture">VIEW ALL THEMES</ArrowLink></div><div className="theme-grid">{themes.map(theme => <article className={`theme-card art ${theme.art}`} key={theme.name}><span className="art-label">{theme.name}</span><ArrowLink href="/scripture">EXPLORE SCRIPTURE</ArrowLink></article>)}</div></div></section>

      <section className="stories" id="stories" aria-labelledby="stories-title"><div className="wrap"><div className="section-top"><div><p className="eyebrow">BIBLICAL STORIES</p><h2 className="section-heading" id="stories-title">STORIES FROM SCRIPTURE</h2><p className="section-copy">Explore the moments, people and events recorded in the Bible.</p></div><ArrowLink href="/stories">EXPLORE ALL STORIES</ArrowLink></div><div className="stories-grid"><a className="story-card story-main art art-fear" href="/stories"><span className="art-label">{stories[0].title}</span><span className="story-ref">{stories[0].reference}</span></a><div className="story-side"><a className="story-card art art-forgiveness" href="/stories"><span className="art-label">{stories[1].title}</span><span className="story-ref">{stories[1].reference}</span></a><a className="story-card art art-fear" href="/stories"><span className="art-label">{stories[2].title}</span><span className="story-ref">{stories[2].reference}</span></a></div></div></div></section>

      <section className="cinematic" aria-labelledby="water-title"><div className="water-art" aria-hidden="true" /><div className="wrap cinematic-content"><p className="eyebrow">MATTHEW 14:22–33</p><h2 className="quote serif" id="water-title">TAKE COURAGE.<br />IT IS I.<br />DO NOT BE AFRAID.</h2><p className="reference">MATTHEW 14:27</p><a className="button" href="/stories">ENTER THE STORY <span aria-hidden="true">→</span></a></div></section>

      <section className="archive" id="archive" aria-labelledby="archive-title"><div className="wrap"><div className="section-top"><div><p className="eyebrow">THE HOLY8BIT ARCHIVE</p><h2 className="section-heading" id="archive-title">SCRIPTURE, PRESERVED IN PIXELS.</h2><p className="section-copy">Explore scenes created from passages throughout Scripture.</p></div><ArrowLink href="/gallery">EXPLORE THE GALLERY</ArrowLink></div><div className="archive-grid">{archive.map(item => <a className={`archive-item art ${item.art}`} href="/gallery" key={item.title} aria-label={`${item.title}, ${item.reference}`}><p>{item.title}<small>{item.reference}</small></p></a>)}</div></div></section>

      <section className="purpose" id="about" aria-labelledby="purpose-title"><div className="wrap"><div className="cross-mark" aria-hidden="true">✣</div><h2 id="purpose-title">PIXEL IS THE MEDIUM.<br />CHRIST IS THE CENTER.</h2><p>HOLY8BIT explores Scripture through cinematic pixel art. Every scene begins with the Word, created not to replace Scripture, but to invite you deeper into it.</p><a className="button" href="/about">ABOUT HOLY8BIT <span aria-hidden="true">→</span></a></div></section>
      <section className="final-word" aria-labelledby="final-title"><div className="wrap"><p className="eyebrow">RETURN TO THE WORD</p><h2 className="quote serif" id="final-title">“Your word is a lamp to my feet and a light to my path.”</h2><p className="reference">PSALM 119:105</p><ArrowLink href="/scripture">CONTINUE EXPLORING SCRIPTURE</ArrowLink></div></section>
    </main>
    <SiteFooter />
  </div>;
}
