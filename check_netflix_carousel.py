import urllib.request

r = urllib.request.urlopen('http://127.0.0.1:5502/index.html', timeout=10)
html = r.read().decode('utf-8')

# Find the Netflix section
netflix_start = html.find('indexNetflixMoviesList')
if netflix_start > 0:
    # Find the <ul> tag
    list_start = html.rfind('<ul', 0, netflix_start)
    # Find the closing </ul>
    list_end = html.find('</ul>', netflix_start)
    netflix_list = html[list_start:list_end + 5]
    
    # Count the number of <li> items
    items = netflix_list.count('<li class')
    print(f'Netflix carousel items found: {items}')
    
    # Show the full section
    if items == 0:
        print('Netflix list is EMPTY')
        print('Content:')
        print(netflix_list[:300])
    else:
        print('Netflix list has items')
        # Extract titles
        import re
        titles = re.findall(r'<strong>([^<]+)</strong>', netflix_list)
        for title in titles[:5]:
            print(f'  - {title}')
