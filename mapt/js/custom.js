function collapseMenu() {
    var actives = $('#sidebar-nav').find('.in, .collapsing');
    actives.each(function(index, element) {
        $(element).collapse('hide');
    });
}

function findNextLink(hash) {
    var $link = $('.book_navigation a[href="'+hash+'"]');
    
    var nextItem = $link.closest('.sub-nav').next('li'),
        nextPanel, nextLink;

    if (nextItem.length) {
        nextLink = nextItem.find('a').attr('href');
    } else {
        nextPanel = $link.closest('.panel-collapse').nextAll('.panel-collapse').first();
        if (nextPanel.length) {
            nextItem = nextPanel.find('.sub-nav').first();
            nextLink = nextItem.find('a').attr('href');
        } else {
            nextPanel = $link.closest('.book_navigation').find('.panel-collapse').first();
            nextItem = nextPanel.find('.sub-nav').first();
            nextLink = nextItem.find('a').attr('href');
        }
    }    
    
    return nextLink;
}

function findPrevLink(hash) {
    var $link = $('.book_navigation a[href="'+hash+'"]');
    
    var prevItem = $link.closest('.sub-nav').prev('li'),
        prevPanel, prevLink;

    if (prevItem.length) {
        prevLink = prevItem.find('a').attr('href');
    } else {
        prevPanel = $link.closest('.panel-collapse').prevAll('.panel-collapse').first();
        if (prevPanel.length) {
            prevItem = prevPanel.find('.sub-nav').last();
            prevLink = prevItem.find('a').attr('href');
        } else {
            prevPanel = $link.closest('.book_navigation').find('.panel-collapse').last();
            prevItem = prevPanel.find('.sub-nav').last();
            prevLink = prevItem.find('a').attr('href');
        }
    }    
    
    return prevLink;
}

function openChapter(hash, $checkLink) {
    var $link = $('.book_navigation a[href="'+hash+'"]');
    var $chapter = $(hash).closest('.col-sm-12');
    
    $('#book-wrapper > .col-sm-12').hide();
    window.location.hash = hash;
    
    if (!$link.closest('.panel-collapse').is('.in, .collapsing')) {
        collapseMenu();
    }
    
    $('.book_navigation li').removeClass('active');
    
    $link.closest('.sub-nav').addClass('active')
        .closest('.panel-collapse').collapse('show')
        .prev('li').addClass('active');
        
    if (!$checkLink || ($checkLink && !$checkLink.closest('.book_navigation').length)) {
        $('#sidebar-wrapper').scrollTop($link.closest('.panel-collapse').prev('li').position().top);
    }
    
    // update next section info
    var nextItem = $link.closest('.sub-nav').next('li'),
        nextPanel, nextText, nextLink;

    if (nextItem.length) {
        nextText = nextItem.find('.section-name').text();
        nextLink = nextItem.find('a').attr('href');
    } else {
        nextPanel = $link.closest('.panel-collapse').nextAll('.panel-collapse').first();
        if (nextPanel.length) {
            nextItem = nextPanel.find('.sub-nav').first();
            nextText = nextItem.find('.section-name').text();
            nextLink = nextItem.find('a').attr('href');
        } else {
            nextItem = false;
        }
    }
    
    if (!nextItem) {
        $('.next-wrapper').hide();
    } else {
        $('.next-wrapper').find('.section-title').text(nextText);
        $('.next-wrapper').find('.btn').attr('href', nextLink);
        $('.next-wrapper').detach().appendTo($chapter).show();
    }    
    
    $chapter.show();
    highlightPreTags();
}

function highlightPreTags() {
    var preTags = $('.reader-container:visible').find('pre');
    if (preTags.length) {
        $(preTags).each(function(i, block) {
            $(this).text(function() {
                debugger;
                return $(this).text().replace('&#13;', '');
            });
            $(this).wrapInner("<code>");
            hljs.highlightBlock(block);
        });
    }
}

var jqueryDocument = $(document);

jqueryDocument.ready(function() {
    $('.cover-img').magnificPopup({
      type: 'image',
      mainClass: 'mfp-with-zoom',
      closeOnContentClick: true,
      showCloseBtn: false,
      zoom: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out'
      }
    });
    
    if ($.tablesorter) {
        var $table = $('#book_list'),

        pagerOptions = {
            container: $(".pager"),
            output: '{startRow} - {endRow} / {filteredRows} ({totalRows})',
            removeRows: true,
            size: 20,
            cssGoto: '.gotoPage'
        };
        
        $table.bind('sortEnd', function() {
            $('#book_list').find('input:not(.disabled):first').focus();
        })
        .tablesorter({
            sortList: [[4,1]],
            widthFixed: true,
            widgets: ["filter", "uitheme"],
            widgetOptions: {
                filter_reset: 'span.reset',
                filter_saveFilters: false,
                filter_formatter: {
                    4: function($cell, indx) {
                        return $.tablesorter.filterFormatter.uiDateCompare($cell, indx, {
                            compare : [ '', '>=', '<=' ],
                            selected: 0,
                            changeMonth: true,
                            changeYear: true,
                            defaultDate: '',
                            yearRange: '2004:2017',
                            dateFormat: 'd M yy'
                        });
                    }
                }
            }
        })
        .tablesorterPager(pagerOptions);
        
        jqueryDocument.off('keydown').on('keydown', function(e) {
            if (!$(e.target).is(':input')) {
                switch(e.which) {
                    case 37: // left
                        $('.btn.prev:first').click();
                    break;
                    case 39: // right
                        $('.btn.next:first').click();
                    break;
                }
            }
        });
    }
    
    $(window).scroll(function() {
        if ($(window).scrollTop() > 300) {
            $('#back_to_top').stop().fadeTo('fast', 0.4);
        } else {
            $('#back_to_top').stop().fadeTo('fast', 0);
        }
    });
    
    $('#back_to_top').click(function(e){
        e.preventDefault();
        $('body').animate({
            scrollTop: 0
        }, 500);
    });
    
    var hash = window.location.hash;
    if (hash && (hash !== '#home') && (hash !== '#')) {
        openChapter(hash);
    } else {
        $('.reader-container, .next-wrapper').hide();
    }    
    
    jqueryDocument.on('keydown', function(e) {
        hash = window.location.hash;
        if (hash && (hash !== '#home') && (hash !== '#')) {
            switch(e.which) {
                case 37: // left
                    openChapter(findPrevLink(hash));
                break;

                case 39: // right
                    openChapter(findNextLink(hash));
                break;
            }
        }
    });    
    
    jqueryDocument.on('click', 'a[href^=#]', function(e) {
        var $that = $(this);
        var href = $that.attr('href');
        var $chapter = $(href).closest('.col-sm-12');
        
        if (!$that.attr('data-toggle') && (href != '#')) {
            e.preventDefault();
            
            if (href == '#home') {
                collapseMenu();
                $('.book_navigation li').removeClass('active');
                $('#sidebar-wrapper').scrollTop(0);
                $('.next-wrapper').hide();
                $('#book-wrapper > .col-sm-12').hide();
                window.location.hash = href;
                $chapter.show();
            } else {
                openChapter(href, $that);
            }
            
            $(window).scrollTop(0);
        }
    });
    
    jqueryDocument.on('click', ".toggle-nav", function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    jqueryDocument.on('show.bs.collapse', '#sidebar-nav .collapse', function() {
        collapseMenu();
    });

    jqueryDocument.on('click', "#code-download", function(e) {
        e.preventDefault();
        if (!$(this).hasClass('disabled')) {
            var nid = $(this).data('nid');
            location.replace('https://www.packtpub.com/code_download/' + nid);
        }
    });
});

var Packtlib = {};
Packtlib.sidebar = {
    toggleResponsive: function() {
        if ($(window).width() < 992) {
            $("#wrapper").toggleClass("toggled");
        }
    },
    closeResponsive: function() {
        if ($(window).width() < 992) {
            $("#wrapper").removeClass("toggled");
        }
    }
};

var lastWidth = $(window).width();
$(window).resize(function() {
    if ($(window).width() !== lastWidth) {
        lastWidth = $(window).width();
        if ($(window).width() < 992) {
            $("#wrapper").removeClass("toggled");
        }
    }
});
