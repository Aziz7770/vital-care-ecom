# Facebook Purchase tracking repair

## Goal
Make every successful website order send a reliable Purchase event to Meta and allow browser/server copies to deduplicate and attribute to ads.

## Changes
- Publish the corrected checkout flow so Browser Purchase fires immediately after the order is saved.
- Use the same order ID as `eventID` in the browser and `event_id` in Conversions API.
- Preserve Meta click/browser identifiers (`fbc` and `fbp`), including building `fbc` from an incoming `fbclid` when needed.
- Send stronger matching fields from checkout: phone, email when supplied, name, district, IP, user agent, and a stable external ID.
- Keep `event_source_url`, order value, BDT currency, order ID, product IDs, quantities, and prices on every server Purchase.
- Validate the live custom-domain code, place a harmless test Purchase with Meta's test code, confirm Meta accepts it, then remove the test order record.

## Important limitation
Meta Ads Manager shows “Website purchases” only for orders attributed to an ad click/view. A normal direct test order can appear in Events Manager while the campaign result remains zero. Dashboard category restrictions and campaign attribution settings are controlled in Meta, not by website code.

## Verification
- Confirm the deployed website contains matching browser/server Event IDs.
- Confirm the order function returns `events_received: 1` from Meta.
- Confirm Telegram order notifications and customer history continue working.
