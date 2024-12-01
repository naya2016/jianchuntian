var searchFunc = function(path, search_id, content_id) {
    'use strict';

    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    function preventScrollPropagation(element) {
        element.addEventListener('wheel', function(e) {
            const isScrollable = this.scrollHeight > this.clientHeight;
            const isScrolledToTop = this.scrollTop === 0;
            const isScrolledToBottom = this.scrollTop + this.clientHeight === this.scrollHeight;

            if (isScrollable) {
                const isScrollingUp = e.deltaY < 0;
                const isScrollingDown = e.deltaY > 0;

                if ((isScrolledToTop && isScrollingUp) || 
                    (isScrolledToBottom && isScrollingDown)) {
                    e.preventDefault();
                } else {
                    e.stopPropagation();
                }
            } else {
                e.preventDefault();
            }
        }, { passive: false });
    }

    function extractNumber(str) {
        const match = str.match(/第(\d+)章/);
        return match ? parseInt(match[1]) : Infinity;
    }

    function compareChapters(a, b) {
        const numA = extractNumber(a.title);
        const numB = extractNumber(b.title);
        return numA - numB;
    }

    $.ajax({
        url: path,
        dataType: "xml",
        success: function(xmlResponse) {
            var datas = $("entry", xmlResponse).map(function() {
                return {
                    title: $("title", this).text(),
                    content: $("content", this).text(),
                    url: $("url", this).text()
                };
            }).get();

            var $input = document.getElementById(search_id);
            var $resultContent = document.getElementById(content_id);

            if (!$input || !$resultContent) return;

            preventScrollPropagation($resultContent);

            $input.addEventListener('input', debounce(function() {
                var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
                $resultContent.innerHTML = "";

                if (this.value.trim().length <= 0) {
                    $resultContent.style.maxHeight = '0';
                    $resultContent.style.opacity = '0';
                    $resultContent.style.padding = '0';
                    setTimeout(() => {
                        $resultContent.innerHTML = "";
                    }, 300);
                    return;
                }

                var matchedResults = [];
                datas.forEach(function(data) {
                    var isMatch = true;
                    var data_title = data.title.trim().toLowerCase();
                    var data_content = data.content.trim().replace(/<[^>]+>/g, "").toLowerCase();
                    var data_url = data.url;
                    var index_title = -1;
                    var index_content = -1;
                    var first_occur = -1;

                    if (data_title != '' && data_content != '') {
                        keywords.forEach(function(keyword, i) {
                            index_title = data_title.indexOf(keyword);
                            index_content = data_content.indexOf(keyword);
                            if (index_title < 0 && index_content < 0) {
                                isMatch = false;
                            } else {
                                if (index_content < 0) {
                                    index_content = 0;
                                }
                                if (i == 0) {
                                    first_occur = index_content;
                                }
                            }
                        });
                    }

                    if (isMatch) {
                        matchedResults.push({
                            title: data.title,
                            content: data.content,
                            url: data_url,
                            first_occur: first_occur
                        });
                    }
                });

                matchedResults.sort(compareChapters);

                if (matchedResults.length === 0) {
                    $resultContent.innerHTML = `
                        <div class="no-result-message">
                            <i>
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                            </i>
                            没有找到与 "${this.value}" 相关的内容
                        </div>`;
                } else {
                    var str = '<ul class="search-result-list">';
                    matchedResults.forEach(function(data) {
                        var content = data.content.trim().replace(/<[^>]+>/g, "");
                        str += `<li onclick="window.location.href='${data.url}'">`;
                        str += `<a class="search-result-title">${data.title}</a>`;
                        
                        if (data.first_occur >= 0) {
                            var start = Math.max(0, data.first_occur - 40);
                            var end = Math.min(content.length, data.first_occur + 120);
                            var match_content = content.substring(start, end);
                            
                            keywords.forEach(function(keyword) {
                                var regS = new RegExp(keyword, "gi");
                                match_content = match_content.replace(regS, function(match) {
                                    return "<em class='search-keyword'>" + match + "</em>";
                                });
                            });

                            str += `<p class="search-result">${start > 0 ? '...' : ''}${match_content}${end < content.length ? '...' : ''}</p>`;
                        }
                        str += "</li>";
                    });
                    str += "</ul>";
                    $resultContent.innerHTML = str;
                }

                requestAnimationFrame(() => {
                    $resultContent.style.maxHeight = '400px';
                    $resultContent.style.opacity = '1';
                    $resultContent.style.padding = '20px';
                    
                    if (matchedResults.length > 0) {
                        const items = $resultContent.getElementsByTagName('li');
                        Array.from(items).forEach((item, index) => {
                            item.style.opacity = '0';
                            item.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                item.style.transition = 'all 0.3s ease';
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, index * 100);
                        });
                    } else {
                        const noResult = $resultContent.querySelector('.no-result-message');
                        if (noResult) {
                            noResult.style.opacity = '0';
                            noResult.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                noResult.style.transition = 'all 0.3s ease';
                                noResult.style.opacity = '1';
                                noResult.style.transform = 'translateY(0)';
                            }, 100);
                        }
                    }
                });
            }, 300));

            document.addEventListener('click', function(e) {
                const searchContainer = document.querySelector('.search');
                if (!searchContainer.contains(e.target)) {
                    $resultContent.style.maxHeight = '0';
                    $resultContent.style.opacity = '0';
                    $resultContent.style.padding = '0';
                    setTimeout(() => {
                        $resultContent.innerHTML = "";
                    }, 300);
                }
            });
        }
    });
}

$(document).ready(function() {
    searchFunc("/search.xml", 'search_value', 'local-search-result');
});
