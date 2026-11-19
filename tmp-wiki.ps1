$ua='TrexiflyVehicleBot/1.0 (https://github.com/elahishahzadnoor12221-create/trexifly)'
$arts=@('Toyota Yaris','Kia Picanto','Suzuki Swift','Toyota Corolla','Honda Civic','Toyota Camry','Hyundai Elantra','Kia Sportage','Hyundai Tucson','Toyota RAV4','MG ZS','Toyota Land Cruiser Prado','Toyota Fortuner','Range Rover','Mercedes-Benz E-Class','BMW 5 Series','Audi A6','Hyundai Staria','Kia Carnival','Toyota HiAce','Mercedes-Benz Sprinter','Toyota Coaster')
$api='https://en.wikipedia.org/w/api.php'
$res=@(); $map=@{}
foreach($a in $arts){
  try{
    $u="${api}?action=query&format=json&redirects=1&prop=pageimages&piprop=name&titles="+[uri]::EscapeDataString($a)
    $r=Invoke-RestMethod -Uri $u -Headers @{'User-Agent'=$ua}
    $p=$r.query.pages.PSObject.Properties.Value | Select-Object -First 1
    if($p.pageimage){ $map[$a]=$p.pageimage } else { $res+=[pscustomobject]@{article=$a;file='(none)'} }
  }catch{ $res+=[pscustomobject]@{article=$a;file="ERR $($_.Exception.Message)"} }
  Start-Sleep -Milliseconds 300
}
New-Item -ItemType Directory -Force E:\trexifly\tmp-vehicles | Out-Null
foreach($a in $map.Keys){
  $f='File:'+$map[$a]
  try{
    $u="${api}?action=query&format=json&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=640&titles="+[uri]::EscapeDataString($f)
    $r=Invoke-RestMethod -Uri $u -Headers @{'User-Agent'=$ua}
    $ii=($r.query.pages.PSObject.Properties.Value | Select-Object -First 1).imageinfo[0]; $em=$ii.extmetadata
    $slug=($a -replace '[^A-Za-z0-9]+','-').ToLower()
    $local="E:\trexifly\tmp-vehicles\$slug.jpg"
    $code=(curl.exe -s -m 30 -A $ua -o $local -w '%{http_code}' $ii.thumburl)
    $res+=[pscustomobject]@{article=$a;slug=$slug;file=$map[$a];w=$ii.width;h=$ii.height;thumb=$ii.thumburl;http=$code;bytes=(Get-Item $local -ErrorAction SilentlyContinue).Length;lic=$em.LicenseShortName.value;licurl=$em.LicenseUrl.value;artist=(($em.Artist.value -replace '<[^>]+>','').Trim());page=$ii.descriptionurl}
  }catch{ $res+=[pscustomobject]@{article=$a;file="ERR2 $($_.Exception.Message)"} }
  Start-Sleep -Milliseconds 300
}
$res | ConvertTo-Json -Depth 4 | Out-File E:\trexifly\tmp-vehicles\meta.json -Encoding utf8
$res | ForEach-Object { '{0}|{1}|{2}x{3}|http={4}|{5}|{6}' -f $_.article,$_.file,$_.w,$_.h,$_.http,$_.bytes,$_.lic } | Out-File E:\trexifly\tmp-vehicles\summary.txt -Encoding utf8
'DONE' | Out-File E:\trexifly\tmp-vehicles\done.txt
