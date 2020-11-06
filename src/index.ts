import * as path from 'path';
import { tfg } from './tfg';

import './provider';
import './remote';

const s3TestBucket = tfg.resource('aws_s3_bucket', 's3_test_bucket', {
  bucket: 'tfg-angelrob-test-bucket',
  acl: 'private',
});

const originId = 'testS3Origin';
const rootOriginId = `S3-${s3TestBucket.attr('bucket')}/root`

tfg.resource('aws_cloudfront_distribution', 'frontend_distribution', {
  origin: [{
    domain_name: s3TestBucket.attr('bucket_regional_domain_name'),
    origin_id: originId,
    origin_path: '/envs/dev'
  }, {
    domain_name: s3TestBucket.attr('bucket_regional_domain_name'),
    origin_id: rootOriginId
  }],

  enabled: true,
  is_ipv6_enabled: true,
  default_root_object: 'index.html',
  restrictions: {
    geo_restriction: {
      restriction_type: 'none'
    }
  },

  viewer_certificate: {
    cloudfront_default_certificate: true
  },

  default_cache_behavior: {
    allowed_methods: ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
    cached_methods: ["GET", "HEAD"],
    target_origin_id: originId,

    forwarded_values: {
      query_string: true,
      cookies: {
        forward: "none"
      }
    },

    viewer_protocol_policy: 'redirect-to-https',
    min_ttl: 0,
    default_ttl: 86400,
    max_ttl: 31536000
  },

  ordered_cache_behavior: {
    path_pattern: '/build/*',
    allowed_methods: ['GET', 'HEAD'],
    cached_methods: ["GET", "HEAD"],
    target_origin_id: rootOriginId,

    forwarded_values: {
      query_string: false,
      cookies: {
        forward: "none"
      }
    },

    viewer_protocol_policy: 'redirect-to-https',
    min_ttl: 0,
    default_ttl: 86400,
    max_ttl: 31536000 
  },

  custom_error_response: [{
    error_caching_min_ttl: 10,
    error_code: 403,
    response_code: 200,
    response_page_path: '/envs/dev/index.html'
  }, {
    error_caching_min_ttl: 10,
    error_code: 404,
    response_code: 200,
    response_page_path: '/envs/dev/index.html'
  }]
})

const outputDir = path.join('output');
tfg.write({ dir: outputDir, format: true });
