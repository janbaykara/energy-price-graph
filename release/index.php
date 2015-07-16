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

<body scroll=1500 ng-class='{
        loading: !UI.dataLoaded,
        "intro-phase": UI.introPhase && scrollDistance < 500,
        "detail-phase": UI.detailPhase,
        "summary-phase": UI.summaryPhase
    }'>
    <main>

        <section id='instructions' class='aln-h-m'>
            <div class='inner'>
                <header>
                    <h1 class='graph-title graph-super-title'>Enterprise Energy Price History</h1>
                    <h2 class='graph-title'>
                        <abbr title='A measure of electrical energy equivalent to a power consumption of one thousand watts for one hour.'>kiloWattHour</abbr> prices for
                        <span class='energies'>
                            <span class='active energy-selector {{name}}'
                                ng-repeat-start='(name, value) in data.energy'
                            ><img ng-src='build/img/energy-{{name}}.png' />{{name}}</span> <span ng-repeat-end></span>
                        </span>
                    </h2>
                </header>
                <p>Gas and electricity prices fluctuate on a daily, and sometimes even hourly, basis. It’s a volatile market influenced by everything from global conflict to natural disasters. The size of your business could even be affecting the price paid per kilowatt-hour.</p>

                <p>This interactive graph tracks the average cost of gas and electricity; highlighting the disparity between the price paid by large corporations and small businesses and the effect of world events.</p>

                <button class='btn clickable big-button block center' ng-click='anim()'>
                    <span ng-show='UI.dataLoaded' ng-click='UI.introPhase = false'>Take a look at the history</span>
                    <i  ng-show='!UI.dataLoaded' class='spinner glyphicon glyphicon-repeat'></i>
                </button>

                <p class='instructions-minor'>This interactive graph uses <a href='https://www.gov.uk/government/statistical-data-sets/gas-and-electricity-prices-in-the-non-domestic-sector'>data from the Department of Energy and Climate Change</a>. We’ve combined this with news stories from the past decade to help illustrate the effect that global conflict, natural disasters and politics can have on fuel prices.</p>
            </line>
        </section>

        <section id='navguide' ng-class='{visible: showNavGuide && !hideNavGuide}'>
            <h1>Browse the stories</h1>
            <p>
                Navigate through the stories that influenced energy prices, by clicking the coloured event bars.
            </p>
            <button class='clickable center block btn big-button' ng-click='hideNavGuide = true'>Got it</button>
        </section>

        <section id='data-view' class='table'>
        <!-- <section id='data-view' class='ng-class: {expanded: getExpand() };'> -->
            <div class='tr' id='title'>
                <div class='td'>
                    <h2 class='graph-title small-title'>
                        kiloWattHour prices for
                        <span class='energies'>
                            <span class='active energy-selector {{name}}'
                                ng-repeat-start='(name, value) in data.energy'
                            ><img ng-src='build/img/energy-{{name}}.png' />{{name}}</span> <span ng-repeat-end></span>
                        </span>
                        in
                        <span class='businesses'>
                            <span class='business-selector'><img ng-src='build/img/business-large.png' />Large</span>
                            <span class='business-selector'><img ng-src='build/img/business-small.png' />Small</span>
                        </span>
                        businesses
                    </h2>
                </div>
            </div>
            <section class='tr' id='graph'>
                <div class='td' graph-chart='loadedData()' index='getIndex()' go='go'></div>
            </section>
            <section class='tr' id='stories' date-list-iterator='getStories()' range='getRange()' index='getIndex()' go='go' ng-click='toggleExpand()'>
                <div class='td'>
                    <ul class='story-list' date-list-iteration-group>
                        <li date-list-iteration-item
                            ng-repeat='story in getStories() track by $index'
                            ng-click='goToTick(story)'
                        >
                            <article class='story-list__article'>
                                <img class='story-list__icon' ng-src='build/img/event-{{story.type}}.png' />
                                <div class='story-list__info'>
                                    <time class='story-list__timestamp'>{{story.year}} Q{{story.quarter}}</time>
                                    <h4 class='story-list__headline'>
                                        {{story.headline}}
                                        <a ng-href='{{story.sources}}' target="_blank">
                                            <img ng-src='build/img/external-link.png' class='extlink' />
                                        </a>
                                    </h4>
                                    <p class='story-list__description'>{{story.description}}</p>
                                </div>
                            </article>
                        </li>
                    </ul>
                </div>
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
