# Unity Host TCP Client - sends JSON commands to UnityHost.exe via TCP
# Accepts structured parameters and builds JSON internally to avoid quoting issues

param(
    [string]$HostName = "127.0.0.1",
    [int]$Port = 7777,
    [string]$Mode = "Single",
    [string]$CommandType = "GetSceneState",
    [string]$ObjectType = "Cube",
    [string]$ObjectId = "",
    [string]$X = "0",
    [string]$Y = "5",
    [string]$Z = "0",
    [int]$Count = 1,
    [string]$Spacing = "1.5",
    [string]$Pattern = "Row",
    [int]$Rows = 3,
    [int]$Cols = 3,
    [string]$Width = "4",
    [string]$Height = "3",
   [string]$StartX = "-5",
   [string]$StartY = "1",
   [string]$StartZ = "5"
   [string]$Color = "",
   [string]$CameraX = "0",
   [string]$CameraY = "10",
   [string]$CameraZ = "-20",
   [string]$LookX = "0",
   [string]$LookY = "0",
   [string]$LookZ = "0",
   [string]$FOV = "60",
   [string]$Angle = "0",
   [string]$Radius = "25",
   [string]$CameraHeight = "15"
)

function Send-Command($cmd) {
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($HostName, $Port)
    $stream = $client.GetStream()
    $writer = New-Object System.IO.StreamWriter($stream, [System.Text.Encoding]::UTF8)
    $writer.NewLine = "`n"
    $writer.AutoFlush = $true
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    $writer.WriteLine($cmd)
    $response = $reader.ReadLine()
    $writer.Close()
    $reader.Close()
    $client.Close()
    return $response
}

function Build-Position($x, $y, $z) {
    return "[$x,$y,$z]"
}

function Build-SpawnCommand($type, $x, $y, $z) {
    $colorPart = ""
    if ($Color) { $colorPart = ',"color":"' + $Color + '"' }
    return '{"command":"Spawn","type":"' + $type + '","position":' + (Build-Position $x $y $z) + $colorPart + '}'
}

if ($Mode -eq "Single") {
    $json = ""
    switch ($CommandType) {
        "GetSceneState" { $json = '{"command":"GetSceneState"}' }
        "Spawn" { $json = Build-SpawnCommand $ObjectType $X $Y $Z }
        "Move" { $json = '{"command":"Move","objectId":"' + $ObjectId + '","position":' + (Build-Position $X $Y $Z) + '}' }
       "Destroy" { $json = '{"command":"Destroy","objectId":"' + $ObjectId + '"}' }
       "SetCamera" { $json = '{"command":"SetCamera","cameraPosition":[' + $CameraX + ',' + $CameraY + ',' + $CameraZ + '],"lookAt":[' + $LookX + ',' + $LookY + ',' + $LookZ + '],"fov":' + $FOV + '}' }
       "OrbitCamera" { $json = '{"command":"OrbitCamera","angle":' + $Angle + ',"radius":' + $Radius + ',"height":' + $CameraHeight + ',"center":[' + $LookX + ',' + $LookY + ',' + $LookZ + ']}' }
       "SetColor" { $json = '{"command":"SetColor","objectId":"' + $ObjectId + '","color":"' + $Color + '"}' }
       default { $json = '{"command":"GetSceneState"}' }
    }
    $result = Send-Command $json
    Write-Output $result
}
elseif ($Mode -eq "Batch") {
    $results = @()
    $client = New-Object System.Net.Sockets.TcpClient
    $client.Connect($HostName, $Port)
    $stream = $client.GetStream()
    $writer = New-Object System.IO.StreamWriter($stream, [System.Text.Encoding]::UTF8)
    $writer.NewLine = "`n"
    $writer.AutoFlush = $true
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    
    switch ($Pattern) {
        "Row" {
            for ($i = 0; $i -lt $Count; $i++) {
                $x = [float]$StartX + ($i * [float]$Spacing)
                $cmd = Build-SpawnCommand $ObjectType $x $StartY $StartZ
                $writer.WriteLine($cmd)
                $results += $reader.ReadLine()
            }
        }
        "Tower" {
            $cubeSize = 1.0
            for ($i = 0; $i -lt $Count; $i++) {
                $y = $cubeSize / 2 + ($i * $cubeSize)
                $cmd = Build-SpawnCommand "Cube" $X $y $Z
                $writer.WriteLine($cmd)
                $results += $reader.ReadLine()
            }
        }
        "Grid" {
            for ($r = 0; $r -lt $Rows; $r++) {
                for ($c = 0; $c -lt $Cols; $c++) {
                    $x = [float]$StartX + ($c * [float]$Spacing)
                    $z = [float]$StartZ + ($r * [float]$Spacing)
                    $cmd = Build-SpawnCommand $ObjectType $x $StartY $z
                    $writer.WriteLine($cmd)
                    $results += $reader.ReadLine()
                }
            }
        }
        "House" {
            $w = [float]$Width
            $h = [float]$Height
            $halfW = $w / 2
            $halfH = $h / 2
            $cx = [float]$X
            $cz = [float]$Z
            $cmds = @(
                (Build-SpawnCommand "Plane" $cx "0" $cz),
                (Build-SpawnCommand "Cube" $cx $halfH ($cz + $halfW)),
                (Build-SpawnCommand "Cube" $cx $halfH ($cz - $halfW)),
                (Build-SpawnCommand "Cube" ($cx - $halfW) $halfH $cz),
                (Build-SpawnCommand "Cube" ($cx + $halfW) $halfH $cz),
                (Build-SpawnCommand "Sphere" $cx ($h + 0.5) $cz)
            )
            foreach ($cmd in $cmds) {
                $writer.WriteLine($cmd)
                $results += $reader.ReadLine()
            }
        }
        "Pyramid" {
            $base = $Count
            $cx = [float]$X
            $cz = [float]$Z
            $y = 0.5
            while ($base -gt 0) {
                for ($i = 0; $i -lt $base; $i++) {
                    $offset = $i - ($base - 1) / 2
                    $cmd = Build-SpawnCommand "Cube" ($cx + $offset) $y $cz
                    $writer.WriteLine($cmd)
                    $results += $reader.ReadLine()
                }
                $base--
                $y += 1.0
            }
        }
        "Circle" {
            $radius = [float]$Spacing
            $cx = [float]$X
            $cy = [float]$Y
            $cz = [float]$Z
            for ($i = 0; $i -lt $Count; $i++) {
                $angle = 2 * [Math]::PI * $i / $Count
                $x = $cx + $radius * [Math]::Cos($angle)
                $z = $cz + $radius * [Math]::Sin($angle)
                $cmd = Build-SpawnCommand $ObjectType $x $cy $z
                $writer.WriteLine($cmd)
                $results += $reader.ReadLine()
            }
        }
        "Spiral" {
            $cx = [float]$X
            $cz = [float]$Z
            $y = 0.5
            for ($i = 0; $i -lt $Count; $i++) {
                $angle = $i * 0.5
                $radius = 1 + $i * 0.3
                $x = $cx + $radius * [Math]::Cos($angle)
                $z = $cz + $radius * [Math]::Sin($angle)
                $cmd = Build-SpawnCommand $ObjectType $x $y $z
                $writer.WriteLine($cmd)
                $results += $reader.ReadLine()
                $y += 0.5
            }
        }
        "Line" {
            for ($i = 0; $i -lt $Count; $i++) {
                $x = [float]$StartX + ($i * [float]$Spacing)
                $cmd = Build-SpawnCommand $ObjectType $x $StartY $StartZ
                $writer.WriteLine($cmd)
                $results += $reader.ReadLine()
            }
        }
        default {
            $cmd = '{"command":"GetSceneState"}'
            $writer.WriteLine($cmd)
            $results += $reader.ReadLine()
        }
    }
    
    $writer.Close()
    $reader.Close()
    $client.Close()
    Write-Output ($results -join "`n")
}
else {
    Write-Output "Error: Unknown mode '$Mode'. Use 'Single' or 'Batch'."
}
