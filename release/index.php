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
        <section id='title-page' full-screen>
            <h1>Enterprise Energy Prices</h1>
            <h2>A Data Journey</h2>
        </section>
        <section id='data-view'>
            <div id='graph'></div>
            <nav id='stories'>
                <ul class='story-list'>
                    <li ng-repeat='story in stories track by $index'>
                        <article class='story-list__article' ng-if='animationPhase(story.Year,story.Quarter)'>
                            <time class='story-list__timestamp'></time>
                            <img class='story-list__icon' ng-src='event-{{story.type}}' />
                            <h4 class='story-list__headline'>{{story.headline}}</h4>
                            <p class='story-list__description'>{{story.description}}</p>
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