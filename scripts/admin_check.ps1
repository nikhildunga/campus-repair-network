$admin = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/admin-login -ContentType 'application/json' -Body (ConvertTo-Json @{email='admin@campus.com'; password='Admin@123456'})
Write-Host "Admin login success: $($admin.success)"
$token = $admin.token
Write-Host "Token length: $($token.Length)"
$headers = @{'Authorization' = "Bearer $token"}
$all = Invoke-RestMethod -Method Get -Uri http://localhost:5000/api/complaints -Headers $headers -ContentType 'application/json'
Write-Host "Complaints count: $($all.count)"
if ($all.count -gt 0) { $all.complaints | ConvertTo-Json -Depth 6 } else { Write-Host 'No complaints found' }