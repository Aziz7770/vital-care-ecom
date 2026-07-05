<?php
/**
 * বিসমিল্লাহ হোমিও চেম্বার - Theme Functions
 */

// Theme Setup
function bismillah_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    
    // Register Navigation Menus
    register_nav_menus(array(
        'primary' => 'প্রাইমারি মেনু',
        'footer'  => 'ফুটার মেনু',
    ));
}
add_action('after_setup_theme', 'bismillah_theme_setup');

// Enqueue Styles & Scripts
function bismillah_enqueue_scripts() {
    wp_enqueue_style('bismillah-style', get_stylesheet_uri(), array(), '1.0');
    wp_enqueue_style('google-fonts', 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap', array(), null);
}
add_action('wp_enqueue_scripts', 'bismillah_enqueue_scripts');

// Custom Product Post Type
function bismillah_register_products() {
    register_post_type('product', array(
        'labels' => array(
            'name'          => 'ঔষধসমূহ',
            'singular_name' => 'ঔষধ',
            'add_new'       => 'নতুন ঔষধ যোগ করুন',
            'add_new_item'  => 'নতুন ঔষধ যোগ করুন',
            'edit_item'     => 'ঔষধ সম্পাদনা করুন',
        ),
        'public'       => true,
        'has_archive'  => true,
        'menu_icon'    => 'dashicons-heart',
        'supports'     => array('title', 'editor', 'thumbnail', 'excerpt'),
        'rewrite'      => array('slug' => 'product'),
    ));
}
add_action('init', 'bismillah_register_products');

// Product Category Taxonomy
function bismillah_register_product_category() {
    register_taxonomy('product_category', 'product', array(
        'labels' => array(
            'name'          => 'ঔষধের ক্যাটাগরি',
            'singular_name' => 'ক্যাটাগরি',
        ),
        'hierarchical' => true,
        'public'       => true,
        'rewrite'      => array('slug' => 'category'),
    ));
}
add_action('init', 'bismillah_register_product_category');

// Product Price Meta Box
function bismillah_add_price_meta_box() {
    add_meta_box('product_price', 'মূল্য তথ্য', 'bismillah_price_meta_box_html', 'product', 'side');
}
add_action('add_meta_boxes', 'bismillah_add_price_meta_box');

function bismillah_price_meta_box_html($post) {
    $price = get_post_meta($post->ID, '_product_price', true);
    $original_price = get_post_meta($post->ID, '_product_original_price', true);
    wp_nonce_field('bismillah_price_nonce', 'bismillah_price_nonce_field');
    ?>
    <p>
        <label>বিক্রয় মূল্য (৳):</label><br>
        <input type="number" name="product_price" value="<?php echo esc_attr($price); ?>" style="width:100%">
    </p>
    <p>
        <label>আসল মূল্য (৳):</label><br>
        <input type="number" name="product_original_price" value="<?php echo esc_attr($original_price); ?>" style="width:100%">
    </p>
    <?php
}

function bismillah_save_price_meta($post_id) {
    if (!isset($_POST['bismillah_price_nonce_field']) || !wp_verify_nonce($_POST['bismillah_price_nonce_field'], 'bismillah_price_nonce')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    
    if (isset($_POST['product_price'])) {
        update_post_meta($post_id, '_product_price', sanitize_text_field($_POST['product_price']));
    }
    if (isset($_POST['product_original_price'])) {
        update_post_meta($post_id, '_product_original_price', sanitize_text_field($_POST['product_original_price']));
    }
}
add_action('save_post_product', 'bismillah_save_price_meta');

// WhatsApp order link helper
function bismillah_whatsapp_link($product_name = '', $price = '') {
    $phone = '8801767678562';
    $message = "আসসালামু আলাইকুম, আমি {$product_name} (৳{$price}) অর্ডার করতে চাই।";
    return "https://wa.me/{$phone}?text=" . urlencode($message);
}
