import os
import re

blog_data = {
    'blog-1.html': {
        'class': 'hero-1',
        'emoji': '🔧',
        'title': 'How to Find a Trusted Plumber Near You',
        'date': '📅 June 2025',
        'read': '⏱ 5 min read',
        'tag': '🏷 Home Services'
    },
    'blog-2.html': {
        'class': 'hero-2',
        'emoji': '✅',
        'title': '5 Reasons to Hire a Verified Professional',
        'date': '📅 June 2025',
        'read': '⏱ 4 min read',
        'tag': '🏷 Safety'
    },
    'blog-3.html': {
        'class': 'hero-3',
        'emoji': '⚙️',
        'title': 'How DoorSkill Works: Post a Job in Minutes',
        'date': '📅 June 2025',
        'read': '⏱ 5 min read',
        'tag': '🏷 How To'
    },
    'blog-4.html': {
        'class': 'hero-4',
        'emoji': '🏠',
        'title': 'Top 10 Home Services in Lahore, Karachi & Islamabad',
        'date': '📅 June 2025',
        'read': '⏱ 7 min read',
        'tag': '🏷 Home Services'
    },
    'blog-5.html': {
        'class': 'hero-5',
        'emoji': '💰',
        'title': 'How to Earn Money Using DoorSkill',
        'date': '📅 June 2025',
        'read': '⏱ 6 min read',
        'tag': '🏷 Earn Money'
    }
}

video_placeholder = """
<div class="video-placeholder" style="background:#000;color:#fff;padding:60px 20px;text-align:center;border-radius:12px;margin:32px 0;">
  <span style="font-size:48px;cursor:pointer;">▶️</span>
  <h3 style="margin-top:16px;color:#fff;">Watch: Quick Overview</h3>
</div>
<div class="info-box" style="background:var(--rose-lt);border-left:4px solid var(--rose);padding:20px;border-radius:8px;margin:24px 0;color:var(--dark);">
  <strong>💡 Pro Tip:</strong> Always verify credentials before starting work.
</div>
"""

def update_file(filename, data):
    path = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(path):
        print(f"File {path} not found")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace hero section
    hero_pattern = re.compile(r'<section class="blog-hero.*?">.*?</section>', re.DOTALL)
    
    new_hero = f"""<section class="blog-hero {data['class']}">
  <div class="blog-hero-content">
    <div style="font-size:3rem;margin-bottom:16px">{data['emoji']}</div>
    <span class="blog-category">{data['tag'].replace('🏷 ', '')}</span>
    <h1>{data['title']}</h1>
    <div class="blog-meta">
      <span>{data['date']}</span>
      <span>{data['read']}</span>
      <span>{data['tag']}</span>
    </div>
  </div>
</section>"""
    
    content = hero_pattern.sub(new_hero, content)

    # Insert video placeholder after first paragraph
    # We find the first <p>...</p> after the summary box or article content start
    # Let's just find the first paragraph inside <article class="article-container"> -> <div class="article-content">
    article_idx = content.find('<div class="article-content">')
    if article_idx != -1:
        first_p_start = content.find('<p>', article_idx)
        if first_p_start != -1:
            first_p_end = content.find('</p>', first_p_start)
            if first_p_end != -1:
                content = content[:first_p_end+4] + video_placeholder + content[first_p_end+4:]

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename}")

for filename, data in blog_data.items():
    update_file(filename, data)
