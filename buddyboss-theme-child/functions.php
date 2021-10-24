<?php
// Exit if accessed directly
if ( !defined( 'ABSPATH' ) ) exit;

// BEGIN ENQUEUE PARENT ACTION
// AUTO GENERATED - Do not modify or remove comment markers above or below:

if ( !function_exists( 'chld_thm_cfg_locale_css' ) ):
    function chld_thm_cfg_locale_css( $uri ){
        if ( empty( $uri ) && is_rtl() && file_exists( get_template_directory() . '/rtl.css' ) )
            $uri = get_template_directory_uri() . '/rtl.css';
        return $uri;
    }
endif;
add_filter( 'locale_stylesheet_uri', 'chld_thm_cfg_locale_css' );
         
if ( !function_exists( 'child_theme_configurator_css' ) ):
    function child_theme_configurator_css() {
        wp_enqueue_style( 'chld_thm_cfg_child', trailingslashit( get_stylesheet_directory_uri() ) . 'style.css', array( 'buddyboss-theme-icons','buddyboss-theme-fonts','buddyboss-theme-magnific-popup-css','buddyboss-theme-select2-css','buddyboss-theme-css' ) );
    }
endif;
add_action( 'wp_enqueue_scripts', 'child_theme_configurator_css', 10 );

// END ENQUEUE PARENT ACTION

//fiter for creating cutom auth in JWT Auth plgin
add_filter('jwt_auth_do_custom_auth', function ( $custom_auth_error, $username, $password, $custom_auth ) {

  //Get user info
  global $wpdb;
  $user_query = $wpdb->prepare( "SELECT user_pass FROM 	wp_ij3mwwkfl3_users WHERE user_login = %s", $username);
  $user_query = $wpdb->get_results($user_query);

  //verify if user exist
  if(sizeof($user_query) == 0) return new WP_Error( 'jwt_auth_custom_auth_failed', __( 'Custom authentication failed: '.'user not found', 'jwt-auth' ) );

  //check hash password
  if(strcmp($password, $user_query[0]->user_pass) !== 0) return new WP_Error( 'jwt_auth_custom_auth_failed', __( 'Custom authentication failed: '.'incorrect password', 'jwt-auth' ) );

  //retun user for JWT token
  $user = $user = get_user_by( 'login', $username );
  return $user;

},10,4);