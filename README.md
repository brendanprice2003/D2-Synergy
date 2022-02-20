# D2Synergy_v0.3

### Re-Production Steps

1. Download XAMPP and configure your firewall(s) to have an open port at `4645`
2. Open XAMPP > click Config next to Apache > Apache (httpd.conf) > Change the port on `Line 60` to `4645` > Change the ServerName on `Line 228` to `localhost`
3. Don't start Apache whilst doing the next few steps
4. Click explorer in XAMPP > `htdocs` > Remove all the items inside this directory
5. Clone this repo to `htdocs`
6. Start Apache
7. Go to `<your external ip>:4645/D2Synergy-v3.0/src/views/app.html` (This url might be different, alternative is below)
8. Or go to `htdocs` and navigate into `src/views` and then app.html, change the `file:///E:/xampp/htdocs/` segment of the url to `<your external ip>:4645/`

If these steps do not work for, please ensure that when (doing step 1) you configure ports on your firewall, that you open it for UDP and TCP on both inbound and outbound rules.

XAMPP does not have to be running for Apache to be running.
If there are any processes on your network that are using port `4645`, please change all references of port `4645`. within this project to your chosen port.