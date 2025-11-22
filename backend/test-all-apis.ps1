Write-Host "========================================"
Write-Host "BookVerse API Gateway - Full Test Suite"
Write-Host "========================================"
Write-Host ""

$results = @()

# Test 1: Health Check
Write-Host "[1/11] Health Check..." -NoNewline
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET
    Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 2: Register
Write-Host "[2/11] Register..." -NoNewline
$body = '{"username":"TestUser4","email":"test4@bookverse.com","password":"Test123456!"}'
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/auth/register" -Method POST -Body $body -ContentType "application/json"
    $data = $r.Content | ConvertFrom-Json
    $global:token = $data.accessToken
    Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " WARN (user exists)" -ForegroundColor Yellow
    $results += "WARN"
}

# Test 3: Login
Write-Host "[3/11] Login..." -NoNewline
$body = '{"email":"test4@bookverse.com","password":"Test123456!"}'
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/auth/login" -Method POST -Body $body -ContentType "application/json"
    $data = $r.Content | ConvertFrom-Json
    $global:token = $data.accessToken
    Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 4: Get Profile
Write-Host "[4/11] Get Profile..." -NoNewline
try {
    $headers = @{Authorization = "Bearer $global:token" }
    $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/user/profile" -Method GET -Headers $headers
    Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 5: Get Books
Write-Host "[5/11] Get Books..." -NoNewline
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/books" -Method GET
    $books = $r.Content | ConvertFrom-Json
    $global:bookId = $books[0]._id
    Write-Host " OK ($($r.StatusCode), $($books.Count) books)" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 6: Search Books
Write-Host "[6/11] Search Books..." -NoNewline
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/books/search?query=test" -Method GET
    Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 7: Get Cart
Write-Host "[7/11] Get Cart..." -NoNewline
try {
    $headers = @{Authorization = "Bearer $global:token" }
    $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/cart" -Method GET -Headers $headers
    Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 8: Add to Cart
Write-Host "[8/11] Add to Cart..." -NoNewline
if ($global:bookId) {
    $body = "{`"bookId`":`"$global:bookId`",`"quantity`":1}"
    try {
        $headers = @{Authorization = "Bearer $global:token" }
        $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/cart/add" -Method POST -Body $body -ContentType "application/json" -Headers $headers
        Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
        $results += "PASS"
    }
    catch {
        Write-Host " FAIL" -ForegroundColor Red
        $results += "FAIL"
    }
}
else {
    Write-Host " SKIP" -ForegroundColor Yellow
    $results += "SKIP"
}

# Test 9: Get Orders
Write-Host "[9/11] Get Orders..." -NoNewline
try {
    $headers = @{Authorization = "Bearer $global:token" }
    $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/orders" -Method GET -Headers $headers
    Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Test 10: Book Detail
Write-Host "[10/11] Book Detail..." -NoNewline
if ($global:bookId) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/books/$global:bookId" -Method GET
        Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
        $results += "PASS"
    }
    catch {
        Write-Host " FAIL" -ForegroundColor Red
        $results += "FAIL"
    }
}
else {
    Write-Host " SKIP" -ForegroundColor Yellow
    $results += "SKIP"
}

# Test 11: Logout
Write-Host "[11/11] Logout..." -NoNewline
try {
    $headers = @{Authorization = "Bearer $global:token" }
    $r = Invoke-WebRequest -Uri "http://localhost:3000/v1/auth/logout" -Method POST -Headers $headers
    Write-Host " OK ($($r.StatusCode))" -ForegroundColor Green
    $results += "PASS"
}
catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results += "FAIL"
}

# Summary
Write-Host ""
Write-Host "========================================"
$passed = ($results | Where-Object { $_ -eq "PASS" }).Count
$warned = ($results | Where-Object { $_ -eq "WARN" }).Count
$failed = ($results | Where-Object { $_ -eq "FAIL" }).Count
$skipped = ($results | Where-Object { $_ -eq "SKIP" }).Count
Write-Host "Results: $passed PASS, $warned WARN, $failed FAIL, $skipped SKIP"
Write-Host "========================================"
