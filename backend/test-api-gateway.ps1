# API Gateway Test Script
# Tests all endpoints through the API Gateway

$baseUrl = "http://localhost:3000"
$token = ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BookVerse API Gateway Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[TEST 1] Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET
    Write-Host "✓ Health Check: " -ForegroundColor Green -NoNewline
    Write-Host $response.StatusCode
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "✗ Health Check Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register User
Write-Host "[TEST 2] Register User..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = "test@bookverse.com"
    password = "Test123456!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/v1/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✓ Register: " -ForegroundColor Green -NoNewline
    Write-Host $response.StatusCode
    $registerData = $response.Content | ConvertFrom-Json
    $registerData | ConvertTo-Json
    if ($registerData.token) {
        $token = $registerData.token
        Write-Host "Token saved: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Register Failed (may already exist): $_" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: Login User
Write-Host "[TEST 3] Login User..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@bookverse.com"
    password = "Test123456!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login: " -ForegroundColor Green -NoNewline
    Write-Host $response.StatusCode
    $loginData = $response.Content | ConvertFrom-Json
    $loginData | ConvertTo-Json
    if ($loginData.token) {
        $token = $loginData.token
        Write-Host "Token saved: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Login Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get User Profile (Protected)
Write-Host "[TEST 4] Get User Profile (Protected)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/v1/user/profile" -Method GET -Headers $headers
    Write-Host "✓ Get Profile: " -ForegroundColor Green -NoNewline
    Write-Host $response.StatusCode
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "✗ Get Profile Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Get All Books (Public)
Write-Host "[TEST 5] Get All Books (Public)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/v1/books" -Method GET
    Write-Host "✓ Get Books: " -ForegroundColor Green -NoNewline
    Write-Host $response.StatusCode
    $booksData = $response.Content | ConvertFrom-Json
    Write-Host "Found $($booksData.Count) books"
    if ($booksData.Count -gt 0) {
        $bookId = $booksData[0]._id
        Write-Host "Sample book ID: $bookId" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Get Books Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 6: Search Books
Write-Host "[TEST 6] Search Books..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/v1/books/search?query=test" -Method GET
    Write-Host "✓ Search Books: " -ForegroundColor Green -NoNewline
    Write-Host $response.StatusCode
    $searchData = $response.Content | ConvertFrom-Json
    Write-Host "Found $($searchData.Count) books matching 'test'"
} catch {
    Write-Host "✗ Search Books Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 7: Get Cart (Protected)
Write-Host "[TEST 7] Get Cart (Protected)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/v1/cart" -Method GET -Headers $headers
    Write-Host "✓ Get Cart: " -ForegroundColor Green -NoNewline
    Write-Host $response.StatusCode
    $response.Content | ConvertFrom-Json | ConvertTo-Json
} catch {
    Write-Host "✗ Get Cart Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 8: Get Orders (Protected)
Write-Host "[TEST 8] Get Orders (Protected)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $response = Invoke-WebRequest -Uri "$baseUrl/v1/orders" -Method GET -Headers $headers
    Write-Host "✓ Get Orders: " -ForegroundColor Green -NoNewline
    Write-Host $response.StatusCode
    $ordersData = $response.Content | ConvertFrom-Json
    Write-Host "Found $($ordersData.Count) orders"
} catch {
    Write-Host "✗ Get Orders Failed: $_" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Import the Postman collection for comprehensive testing:" -ForegroundColor Yellow
Write-Host "File: BookVerse-API-Gateway-Tests.postman_collection.json" -ForegroundColor Cyan
