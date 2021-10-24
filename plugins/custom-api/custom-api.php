<?php
/*
Plugin Name: Custom API
Version: 1.0
Description: Customize api endpoints
Author: Yifei Yu
License: GPL v3
*/

// To handle the get request that uses facebook post id to get the specified post
function get_fbposts($data){

  // Create an argument that finds the post using facebook post id
  $args = array(
    'post_type' => 'fbposts',
    'post_status' => 'any',
    'meta_query' => array(
      array(
        'key' => 'post_id',
        'value' => $data['id'],
        'compare' => '='
      )
    )
  );

  // Get the post by facebook post id
  $posts = get_posts($args);
  
  // When no post is found, return 404 error
  if (empty($posts)){
    return new WP_Error( 'no_posts', __('No post found'), array( 'status' => 404 ) );
  }
  // When a post is found, return it
  else{
    $post_id = $posts[0]->ID;
    $posts[0]->acf = get_fields($post_id);
    return $posts[0];
  }
}

// An API endpoint that uses facebook id to get the posts
add_action('rest_api_init', function(){
  register_rest_route('custom-api/v1', 'fbposts/(?P<id>\w+)', array(
    'methods' => 'GET',
    'callback' => 'get_fbposts'
  ));
});


// To handle the update request that uses facebook post id to update the specified post
function update_fbposts($data){

  // Create an argument that finds the post using facebook post id
  $args = array(
    'post_type' => 'fbposts',
    'post_status' => 'any',
    'meta_query' => array(
      array(
        'key' => 'post_id',
        'value' => $data['id'],
        'compare' => '='
      )
    )
  );

  // Get the post by facebook post id
  $post = get_posts($args);

  // When no post is found, return 404 error
  if (empty($post)){
    return new WP_Error( 'no_posts', __('No post found'), array( 'status' => 404 ) );
  }
  // When a post is found, update it
  else{
    $post_id = $post[0]->ID;

    $test_args = array(
      'ID' => $post_id,
      'post_title' => $data['title']
    );

    $to_update = array(
      'ID' => $post_id
    );

    $to_update = $to_update + $data->get_json_params();

    return wp_update_post($to_update, true);
  }

}

// An API endpoint that uses facebook post id to update the specified post
add_action('rest_api_init', function(){
  register_rest_route('custom-api/v1', 'fbposts/(?P<id>\w+)', array(
    'methods' => 'POST',
    'callback' => 'update_fbposts'
  ));
});


// To handle the delete request that uses facebook post id to delete the specified post
function delete_fbpost($data){

  // Create an argument that finds the post using facebook post id
  $args = array(
    'post_type' => 'fbposts',
    'post_status' => 'any',
    'meta_query' => array(
      array(
        'key' => 'post_id',
        'value' => $data['id'],
        'compare' => '='
      )
    )
  );

  // Get the post by facebook post id
  $post = get_posts($args)[0]->ID;

  // When no post is found, return 404 error
  if (empty($post)){
    return new WP_Error( 'no_posts', __('No post found'), array( 'status' => 404 ) );
  }
  // When a post is found, delete it
  else{
    $post_id = get_posts($args)[0]->ID;
    wp_delete_post($post_id, true);
    return array( 'success' => true );
  }
}

// An API endpoint that uses facebook post id to delete the specified post
add_action('rest_api_init', function(){
  register_rest_route('custom-api/v1', 'fbposts/(?P<id>\w+)', array(
    'methods' => 'DELETE',
    'callback' => 'delete_fbpost'
  ));
});


// To handle the get request that gets all the pending posts
function get_pending_fbposts($data){

  // Create an argument that finds all the pending posts
  $args = array(
    'post_type' => 'fbposts',
    'post_status' => 'pending',
    'nopaging' => true
  );

  // Get the pending posts
  $posts = get_posts($args);

  // Append the custom fields to each pending post
  foreach($posts as $post){
    $post_id = $post->ID;
    $post->acf = get_fields($post_id);
  }

  return $posts;
}

// An API endpoint that gets all the pending posts
add_action('rest_api_init', function(){
  register_rest_route('custom-api/v1', 'fbposts-pending', array(
    'methods' => 'GET',
    'callback' => 'get_pending_fbposts'
  ));
});


// To handle the get request that gets all the posts regardless of the status
function get_fbposts_with_any_status($data){

  // Create an argument that finds all the posts regardless of the status
  $args = array(
    'post_type' => 'fbposts',
    'post_status' => 'any',
    'nopaging' => true
  );

  // Get the posts
  $posts = get_posts($args);

  // Append the custom fields to each post
  foreach($posts as $post){
    $post_id = $post->ID;
    $post->acf = get_fields($post_id);
  }

  return $posts;
}

// An API endpoint that gets all the posts regardless of the status
add_action('rest_api_init', function(){
  register_rest_route('custom-api/v1', 'fbposts-any-status', array(
    'methods' => 'GET',
    'callback' => 'get_fbposts_with_any_status'
  ));
});