const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Starting bucket creation...');
  const buckets = ['store-assets', 'product-images'];
  
  for (const bucket of buckets) {
    console.log(`Creating bucket: ${bucket}`);
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
      fileSizeLimit: 5242880
    });
    
    if (error) {
      console.error(`Error creating bucket ${bucket}:`, error.message);
    } else {
      console.log(`Created bucket ${bucket}:`, data);
    }
    
    // Also create RLS policies for storage objects if necessary
    // But since it's a public bucket and we upload with standard client, we might need policy for insert.
  }
  
  console.log('Done.');
  process.exit(0);
}
main();
