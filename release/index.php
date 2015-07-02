<!DOCTYPE html>
<html lang='en-gb' ng-app='main' ng-controller='main'>

<?php
    $url = "";
    $asseturl = $url."build/";
    $description = "An interactive timeline which tracks trends in electricity and gas prices for small businesses from 2004 to the present day.";
    $title = 'Energy Price Timeline | SwitchmyBusiness.com'
?>

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <link rel='stylesheet' href='<?=$asseturl?>css/app.min.css' />
    <link rel="canonical" href="<?=$url?>" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="theme-color" content="#092C38">
    <title><?=$title?></title>

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="<?=$title?>" />
    <meta name="twitter:site" content="@switchmybiz" />

    <meta property="og:type" content="article" />
    <meta property="og:title" content="<?=$title?>" />
    <meta property="og:site_name" content="SwitchMyBusiness" />

    <!-- IMAGE -->
    <meta property="og:image" content="<?=$asseturl?>img/social.png" />
    <meta name="twitter:image" content="<?=$asseturl?>img/social.png" />

    <!-- DESCRIPTION -->
    <meta property="twitter:description" content="<?=$description?>" />
    <meta property="og:description" content="<?=$description?>" />
    <meta itemprop='description' content="<?=$description?>" />
</head>

<body scroll=2000 class='loading'>

    <main>
        <section id='instructions' class='aln-h-m'>
            <div class='inner'>
                <header>
                    <h2 class='graph-title'>
                        Price per <abbr title='A measure of electrical energy equivalent to a power consumption of one thousand watts for one hour.'>kiloWattHour</abbr> for
                        <span class='energies'>
                            <span class='active energy-selector {{name}}'
                                ng-repeat-start='(name, value) in data.energy'
                            ><img ng-src='build/img/energy-{{name}}.png' />{{name}}</span> <span ng-repeat-end></span>
                        </span>
                    </h2>
                    <div class='graph-key'>
                        <div class='inline-block graph-key__item'>
                            <span><em>Small</em> Businesses</span>
                            <svg class='line' width='50px' height='15px'>
                                <g class='electricity'><g class='average_small'><line x1='0' x2='100%' y1='33%' y2='33%' /></g></g>
                                <g class='gas'><g class='average_small'><line x1='0' x2='100%' y1='66%' y2='66%' /></g></g>
                            </svg>
                        </div>
                        <div class='inline-block graph-key__item'>
                            <span><em>Large</em> Businesses</span>
                            <svg class='line' width='50px' height='15px'>
                                <g class='electricity'><g class='average_large'><line x1='0' x2='100%' y1='33%' y2='33%' /></g></g>
                                <g class='gas'><g class='average_large'><line x1='0' x2='100%' y1='66%' y2='66%' /></g></g>
                            </svg>
                        </div>
                    </div>
                </header>
                <p>Gas and electricity prices fluctuate on a daily, and sometimes even hourly, basis. It’s a volatile market influenced by everything from global conflict to natural disasters. The size of your business could even be affecting the price paid per kilowatt-hour.</p>

                <p>This interactive graph tracks the average cost of gas and electricity; highlighting the disparity between the price paid by large corporations and small businesses and the effect of world events.</p>

                <p>Simply scroll to begin.</p>

                <img class='scrollimg' src='http://yzalis.com/img/scroll-down.png' />

                <p class='instructions-minor'>This interactive graph uses data from the Department of Energy and Climate change. We’ve combined this with news stories from the past decade to help illustrate the effect that global conflict, natural disasters and politics can have on fuel prices.</p>

            </line>
        </section>
        <section id='data-view'>
        <!-- <section id='data-view' class='ng-class: {expanded: getExpand() };'> -->
            <section id='graph' graph-chart='loadedData()' index='atIndex()' go='go'></section>
            <section id='stories' date-list-iterator='getStories()' range='getRange()' index='atIndex()' go='go'
                ng-click='toggleExpand()'
            >
                <ul class='story-list' date-list-iteration-group>
                    <li date-list-iteration-item
                        ng-repeat='story in getStories() track by $index'
                        ng-click='setIndex(story)'
                    >
                        <article class='story-list__article'>
                            <img class='story-list__icon' ng-src='build/img/event-{{story.type}}.png' />
                            <time class='story-list__timestamp'>{{story.year}} Q{{story.quarter}}</time>
                            <h4 class='story-list__headline'>
                                {{story.headline}}
                                <a ng-href='{{story.sources}}' target="_blank">
                                    <img ng-src='build/img/external-link.png' class='extlink' />
                                </a>
                            </h4>
                            <p class='story-list__description'>{{story.description}}</p>
                        </article>
                    </li>
                </ul>
            </section>
        </section>
    </main>

    <!-- DEPENDENCIES -->
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>
    <script src="<?=$asseturl?>js/lib.min.js"></script>
    <script src="<?=$asseturl?>js/app.min.js"></script>
</body>

</html>