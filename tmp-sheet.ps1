Add-Type -AssemblyName System.Drawing
$dir='E:\trexifly\tmp-vehicles'
$groups=@(
 @('toyota-yaris','kia-picanto','suzuki-swift','toyota-corolla','honda-civic','toyota-camry','hyundai-elantra','kia-sportage','hyundai-tucson','toyota-rav4','mg-zs'),
 @('toyota-land-cruiser-prado','toyota-fortuner','range-rover','mercedes-benz-e-class','bmw-5-series','audi-a6','hyundai-staria','kia-carnival','toyota-hiace','mercedes-benz-sprinter','toyota-coaster')
)
$n=1
foreach($g in $groups){
  $cols=3; $rows=[math]::Ceiling($g.Count/$cols); $cw=420; $ch=290
  $bmp=New-Object System.Drawing.Bitmap ($cols*$cw),($rows*$ch)
  $gr=[System.Drawing.Graphics]::FromImage($bmp); $gr.Clear([System.Drawing.Color]::White)
  $font=New-Object System.Drawing.Font('Arial',14,[System.Drawing.FontStyle]::Bold)
  for($i=0;$i -lt $g.Count;$i++){
    $img=[System.Drawing.Image]::FromFile("$dir\$($g[$i]).jpg")
    $x=($i % $cols)*$cw; $y=[math]::Floor($i/$cols)*$ch
    $s=[math]::Min(($cw-10)/$img.Width,($ch-34)/$img.Height); $w=[int]($img.Width*$s); $h=[int]($img.Height*$s)
    $gr.DrawImage($img,$x+5+[int](($cw-10-$w)/2),$y+30,$w,$h)
    $gr.DrawString($g[$i],$font,[System.Drawing.Brushes]::Black,$x+6,$y+4)
    $img.Dispose()
  }
  $bmp.Save("$dir\sheet$n.jpg",[System.Drawing.Imaging.ImageFormat]::Jpeg); $gr.Dispose(); $bmp.Dispose(); $n++
}
'ok' | Out-File "$dir\sheets-done.txt"
