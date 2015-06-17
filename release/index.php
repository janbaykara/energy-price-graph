<!DOCTYPE html>
<html lang='en-gb' ng-app='main' ng-controller='main'>

<?php
    $url = "";
    $asseturl = $url."build/";
    $description = "___DESC___";
    $title = '___TITLE___'
?>

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
    <link rel='stylesheet' href='<?=$asseturl?>css/app.min.css' />
    <link rel="canonical" href="<?=$url?>" />

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

<body>

    <main>
        <!-- <section id='title-page' full-screen>
            <h1>Enterprise Energy Prices</h1>
            <h2>A Data Journey</h2>
        </section> -->
        <section id='data-view'>
            <header>
                <h2 class='graph-title'>
                    Price per <abbr title='A measure of electrical energy equivalent to a power consumption of one thousand watts for one hour.'>kiloWattHour</abbr> for
                    <span class='energies'>
                        <span class='clickable energy-selector'
                            ng-repeat-start='(name, value) in energy'
                            ng-class='{ "active": name === energySelector }'
                            ng-click='selectedEnergy(name,value)'
                        ><img ng-src='build/img/energy-{{name}}.png' />{{name}}</span> <span ng-repeat-end></span>
                    </span>
                </h2>
                <div class='graph-key'>
                    <div class='inline-block graph-key__item average_small'>
                        <span>Cost to <em>Small</em> Businesses</span>
                        <svg class='line' width='50px' height='20px'><line x1='0' x2='100%' y1='10px' y2='10px' /></svg>
                    </div>
                    <div class='inline-block graph-key__item average_large'>
                        <span>Cost to <em>Large</em> Businesses</span>
                        <svg class='line' width='50px' height='20px'><line x1='0' x2='100%' y1='10px' y2='10px' /></svg>
                    </div>
                </div>
            </header>
            <div id='graph'></div>
            <nav id='stories'>
                <ul class='story-list'>
                    <li ng-repeat='story in stories' ng-if='animationPhase(story.Year,story.Quarter)'>
                        <article class='story-list__article'>
                            <time class='story-list__timestamp'></time>
                            <img class='story-list__icon' ng-src='build/img/event-{{story.text.type}}.png' />
                            <h4 class='story-list__headline'>{{story.text.headline}}</h4>
                            <p class='story-list__description'>{{story.text.description}}</p>
                        </article>
                    </li>
                </ul>
            </nav>
        </section>
    </main>

    <!-- DEPENDENCIES -->
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.3.14/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.4.13/d3.min.js"></script>
    <script src="<?=$asseturl?>js/lib.min.js"></script>
    <script src="<?=$asseturl?>js/app.min.js"></script>
</body>

</html>