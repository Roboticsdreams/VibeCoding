<?php

namespace App\Controllers;

use App\Utils\Response;

class Controller
{
    protected $response;
    
    public function __construct()
    {
        $this->response = new Response();
    }
    
    protected function json($data, $statusCode = 200)
    {
        return $this->response->json($data, $statusCode);
    }
    
    protected function validate($data, $rules)
    {
        $errors = [];
        
        foreach ($rules as $field => $rule) {
            $rulesArray = explode('|', $rule);
            $value = $data[$field] ?? null;
            
            foreach ($rulesArray as $r) {
                if ($r === 'required' && (is_null($value) || $value === '')) {
                    $errors[$field][] = "The {$field} field is required.";
                } elseif ($r === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $errors[$field][] = "The {$field} must be a valid email address.";
                } elseif ($r === 'date' && !strtotime($value)) {
                    $errors[$field][] = "The {$field} is not a valid date.";
                } elseif (strpos($r, 'min:') === 0) {
                    $min = (int) substr($r, 4);
                    if (strlen($value) < $min) {
                        $errors[$field][] = "The {$field} must be at least {$min} characters.";
                    }
                } elseif (strpos($r, 'max:') === 0) {
                    $max = (int) substr($r, 4);
                    if (strlen($value) > $max) {
                        $errors[$field][] = "The {$field} may not be greater than {$max} characters.";
                    }
                }
            }
        }
        
        if (!empty($errors)) {
            return $this->json(['errors' => $errors], 422);
        }
        
        return null;
    }
}
