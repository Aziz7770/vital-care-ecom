<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="বিসমিল্লাহ হোমিও চেম্বার - প্রাকৃতিক চিকিৎসায় সুস্থ জীবন গড়ে তুলুন। ১০০% আসল হোমিওপ্যাথিক ঔষধ।">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- Top Bar -->
<div class="top-bar">
    <div class="container">
        <span>দিবা রাত্রি আপনাদের চিকিৎসা সেবায় নিয়োজিত</span>
    </div>
</div>

<!-- Navbar -->
<header class="navbar">
    <div class="container">
        <a href="<?php echo home_url(); ?>" class="navbar-brand">
            বিসমিল্লাহ হোমিও চেম্বার
        </a>
        <ul class="navbar-nav">
            <li><a href="<?php echo home_url(); ?>">হোম</a></li>
            <li><a href="<?php echo home_url('/products'); ?>">সকল ঔষধ</a></li>
            <li><a href="<?php echo home_url('/consultation'); ?>">ডাক্তার পরামর্শ</a></li>
            <li><a href="<?php echo home_url('/about'); ?>">আমাদের সম্পর্কে</a></li>
            <li><a href="<?php echo home_url('/contact'); ?>">যোগাযোগ</a></li>
        </ul>
        <button class="mobile-menu-btn" onclick="document.querySelector('.navbar-nav').classList.toggle('active')">☰</button>
    </div>
</header>
