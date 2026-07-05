<?php get_header(); ?>

<!-- Hero Section -->
<section class="hero">
    <h1>প্রাকৃতিক চিকিৎসায় গড়ে তুলুন <span style="color:#FFD700;">সুস্থ জীবন</span></h1>
    <p>বিসমিল্লাহ হোমিও চেম্বার আপনাদের বিশ্বাস এবং আস্থার জায়গা। বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন সম্পূর্ণ ফ্রি।</p>
    <div>
        <a href="<?php echo home_url('/products'); ?>" class="btn btn-primary">ঔষধ দেখুন →</a>
        <a href="<?php echo home_url('/consultation'); ?>" class="btn btn-secondary" style="background-color:#FFD700;color:#333;border:none;">ফ্রি পরামর্শ নিন</a>
    </div>
</section>

<!-- Trust Badges -->
<section class="trust-badges" style="border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;background:#f0fdf4;">
    <div class="trust-badge">🛡️ <span>১০০% রোগ মুক্তি</span></div>
    <div class="trust-badge">🚚 <span>দ্রুত ডেলিভারি (২-৩ দিন)</span></div>
    <div class="trust-badge">🕐 <span>২৪/৭ সাপোর্ট</span></div>
    <div class="trust-badge">👨‍⚕️ <span>বিশেষজ্ঞ ডাক্তার - ফ্রি পরামর্শ</span></div>
</section>

<!-- Products Section -->
<section class="container" style="padding:3rem 1rem;">
    <h2 class="text-center">জনপ্রিয় ঔষধসমূহ</h2>
    <p class="text-center" style="color:#666;margin-top:0.5rem;">সবচেয়ে বেশি বিক্রিত ঔষধ</p>

    <div class="products-grid">
        <?php
        $products = new WP_Query(array(
            'post_type'      => 'product',
            'posts_per_page' => 8,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ));

        if ($products->have_posts()) :
            while ($products->have_posts()) : $products->the_post();
                $price = get_post_meta(get_the_ID(), '_product_price', true);
                $original_price = get_post_meta(get_the_ID(), '_product_original_price', true);
                $discount = ($original_price && $original_price > 0) ? round((($original_price - $price) / $original_price) * 100) : 0;
        ?>
        <div class="product-card">
            <?php if ($discount > 0) : ?>
                <div class="discount-badge" style="position:absolute;margin:0.5rem;"><?php echo $discount; ?>% ছাড়</div>
            <?php endif; ?>
            
            <?php if (has_post_thumbnail()) : ?>
                <a href="<?php the_permalink(); ?>">
                    <?php the_post_thumbnail('medium', array('style' => 'width:100%;height:200px;object-fit:cover;')); ?>
                </a>
            <?php endif; ?>
            
            <div class="card-body">
                <a href="<?php the_permalink(); ?>">
                    <h3 class="card-title"><?php the_title(); ?></h3>
                </a>
                <div style="margin-top:0.5rem;">
                    <span class="price">৳<?php echo esc_html($price); ?></span>
                    <?php if ($original_price && $discount > 0) : ?>
                        <span class="original-price">৳<?php echo esc_html($original_price); ?></span>
                    <?php endif; ?>
                </div>
                <div style="margin-top:0.75rem;display:flex;gap:0.5rem;">
                    <a href="<?php echo bismillah_whatsapp_link(get_the_title(), $price); ?>" target="_blank" class="btn btn-primary" style="flex:1;font-size:0.875rem;">অর্ডার করুন</a>
                </div>
                <div style="margin-top:0.5rem;display:flex;gap:0.75rem;justify-content:center;font-size:0.7rem;color:#666;">
                    <span>✅ বিশ্বস্ত প্রতিষ্ঠান</span>
                    <span>🚚 দ্রুত ডেলিভারি</span>
                    <span>💵 Cash on Delivery</span>
                </div>
            </div>
        </div>
        <?php
            endwhile;
            wp_reset_postdata();
        else :
        ?>
            <p class="text-center">এখনো কোনো ঔষধ যোগ করা হয়নি।</p>
        <?php endif; ?>
    </div>
</section>

<!-- About Section -->
<section class="about-section">
    <div class="container">
        <h2 class="text-center">আমাদের সম্পর্কে</h2>
        <p class="text-center" style="color:#666;margin-top:0.5rem;">বিসমিল্লাহ হোমিও চেম্বার</p>
        <div class="about-grid">
            <div class="about-card">
                <h3>✅ ১০০% নির্ভরযোগ্য প্রতিষ্ঠান</h3>
                <p>আমরা অরজিনাল হোমিওপ্যাথিক ঔষধ সরবরাহ করি, যাতে আপনি পান নিরাপদ ও কার্যকর চিকিৎসা।</p>
            </div>
            <div class="about-card">
                <h3>✅ ১০+ বছরের অভিজ্ঞতা</h3>
                <p>হোমিওপ্যাথিক চিকিৎসা ক্ষেত্রে আমাদের ১০ বছরেরও বেশি অভিজ্ঞতা রয়েছে, যা আমাদের সেবাকে করেছে আরও বিশ্বস্ত ও কার্যকর।</p>
            </div>
            <div class="about-card">
                <h3>✅ গ্রাহকের আস্থা ও সন্তুষ্টি</h3>
                <p>হাজার হাজার সন্তুষ্ট রোগীদের বিশ্বাসই আমাদের সবচেয়ে বড় অর্জন। আমরা সর্বদা সেরা সেবা দিতে প্রতিশ্রুতিবদ্ধ।</p>
            </div>
            <div class="about-card">
                <h3>✅ অভিজ্ঞ বিশেষজ্ঞ টিম</h3>
                <p>আমাদের রয়েছে BHMS ও DHMS ডিগ্রিধারী দক্ষ ও অভিজ্ঞ চিকিৎসকদের একটি পেশাদার টিম।</p>
            </div>
        </div>
    </div>
</section>

<!-- Doctor Consultation Section -->
<section class="consultation-section">
    <div class="container text-center">
        <h2>অভিজ্ঞ হোমিওপ্যাথিক ডাক্তারের <span class="text-primary">ফ্রি পরামর্শ</span></h2>
        <p style="margin-top:1rem;color:#666;max-width:600px;margin-left:auto;margin-right:auto;">
            আমাদের অভিজ্ঞ ডাক্তারগণ আপনার সমস্যা শুনে সঠিক ঔষধ নির্বাচন করে দেবেন। ফোন বা অনলাইনে পরামর্শ নিন সম্পূর্ণ বিনামূল্যে।
        </p>
        <ul style="list-style:none;margin-top:1.5rem;display:inline-block;text-align:left;">
            <li>✓ BHMS ও DHMS ডিগ্রিধারী ডাক্তার</li>
            <li>✓ ১০+ বছরের অভিজ্ঞতা</li>
            <li>✓ ফোন ও অনলাইনে পরামর্শ</li>
            <li>✓ সম্পূর্ণ বিনামূল্যে</li>
        </ul>
        <div style="margin-top:2rem;">
            <a href="https://wa.me/8801767678562?text=আসসালামু আলাইকুম, আমি ডাক্তারের পরামর্শ নিতে চাই।" target="_blank" class="btn btn-primary">পরামর্শ নিন</a>
        </div>
    </div>
</section>

<!-- Contact Section -->
<section class="contact-section">
    <div class="container">
        <h2 class="text-center">যোগাযোগ করুন</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:1.5rem;margin-top:2rem;">
            <div class="about-card">
                <h4>📞 ফোন</h4>
                <p><a href="tel:01767678562">০১৭৬৭৬৭৮৫৬২</a></p>
            </div>
            <div class="about-card">
                <h4>✉️ ইমেইল</h4>
                <p><a href="mailto:bismillahhomeochamber@gmail.com">bismillahhomeochamber@gmail.com</a></p>
            </div>
            <div class="about-card">
                <h4>📍 ঠিকানা</h4>
                <p>গোপালগঞ্জ, কাশিয়ানী উপজেলা কেন্দ্রীয় জামে মসজিদ সংলগ্ন</p>
            </div>
            <div class="about-card">
                <h4>🕐 সময়সূচী</h4>
                <p>দিবা রাত্রি সেবা চালু</p>
            </div>
        </div>
    </div>
</section>

<?php get_footer(); ?>
