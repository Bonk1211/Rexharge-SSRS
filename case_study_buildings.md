# Smart Solar Rooftop Simulator — Quick-Load Case Study Buildings

Hosted at **https://solar.limziyang.ml**

5 pre-built drone-photogrammetry reconstructions ready for the simulator. Each ships with: a 3D mesh (GLB), a Google Maps measurement PNG (for VLM scale calibration), a thumbnail image, and default site parameters (coordinates, monthly load, TNB tariff).

---

## Summary Table

| # | Model ID | Building | Location | Coords (lat, lng) | Usage | Tariff | Type |
|---|---|---|---|---|---|---|---|
| 1 | `video_2` | SSU UM No.2 Electrical Substation | UM Campus, KL | 3.128080, 101.651010 | 5,000 kWh/mo | Commercial LV | Commercial |
| 2 | `video_5` | Star Grocer | Taman Paramount, PJ | 3.106827, 101.624123 | 10,000 kWh/mo | Commercial LV | Commercial |
| 3 | `video_6` | Rainbow Recreation Center | Taman Paramount, PJ | 3.110072, 101.622002 | 8,000 kWh/mo | Commercial LV | Commercial |
| 4 | `video_4` | Household | Taman Paramount, PJ | 3.108156, 101.622418 | 600 kWh/mo | Domestik | Residential |
| 5 | `video_7` | Eco Horizon | Penang (Batu Kawan) | 5.237826, 100.452277 | 700 kWh/mo | Domestik | Residential |

---

## 1. SSU UM No.2 Electrical Substation

- **Model ID:** `video_2`
- **Location:** University Malaya Campus, Kuala Lumpur
- **Coordinates:** 3.128080° N, 101.651010° E
- **Default load:** 5,000 kWh/month
- **Default tariff:** TNB Komersial Voltan Rendah (Commercial LV)
- **3D Model:** https://solar.limziyang.ml/static/models/video_2/3DModel.glb
- **GMap Measurement PNG:** https://solar.limziyang.ml/static/measurement/ssu.png
- **Thumbnail:** https://solar.limziyang.ml/static/SSU.png
- **Direct simulator launch:** https://solar.limziyang.ml/simulator?model=/static/models/video_2/3DModel.glb&lat=3.128080&lng=101.651010&usage=5000&tariff=commercial_lv

---

## 2. Star Grocer

- **Model ID:** `video_5`
- **Location:** Taman Paramount, Petaling Jaya
- **Coordinates:** 3.106827° N, 101.624123° E
- **Default load:** 10,000 kWh/month
- **Default tariff:** TNB Komersial Voltan Rendah (Commercial LV)
- **3D Model:** https://solar.limziyang.ml/static/models/video_5/3DModel.glb
- **GMap Measurement PNG:** https://solar.limziyang.ml/static/measurement/star_grocer.png
- **Thumbnail:** https://solar.limziyang.ml/static/STAR_GROCER.jpg
- **Direct simulator launch:** https://solar.limziyang.ml/simulator?model=/static/models/video_5/3DModel.glb&lat=3.1068265&lng=101.6241227&usage=10000&tariff=commercial_lv

---

## 3. Rainbow Recreation Center

- **Model ID:** `video_6`
- **Location:** Taman Paramount, Petaling Jaya
- **Coordinates:** 3.110072° N, 101.622002° E
- **Default load:** 8,000 kWh/month
- **Default tariff:** TNB Komersial Voltan Rendah (Commercial LV)
- **3D Model:** https://solar.limziyang.ml/static/models/video_6/3DModel.glb
- **GMap Measurement PNG:** https://solar.limziyang.ml/static/measurement/rainbow.png
- **Thumbnail:** https://solar.limziyang.ml/static/RAINBOW.png
- **Direct simulator launch:** https://solar.limziyang.ml/simulator?model=/static/models/video_6/3DModel.glb&lat=3.110072&lng=101.622002&usage=8000&tariff=commercial_lv

---

## 4. Household

- **Model ID:** `video_4`
- **Location:** Taman Paramount, Petaling Jaya
- **Coordinates:** 3.108156° N, 101.622418° E
- **Default load:** 600 kWh/month
- **Default tariff:** TNB Domestik (Rumah)
- **3D Model:** https://solar.limziyang.ml/static/models/video_4/3DModel.glb
- **GMap Measurement PNG:** https://solar.limziyang.ml/static/measurement/household.png
- **Visible measurement on GMap PNG:** 13.51 m
- **Thumbnail:** https://solar.limziyang.ml/static/HOUSEHOLD.png
- **Direct simulator launch:** https://solar.limziyang.ml/simulator?model=/static/models/video_4/3DModel.glb&lat=3.108156&lng=101.622418&usage=600&tariff=domestic

---

## 5. Eco Horizon

- **Model ID:** `video_7`
- **Location:** Eco Horizon, Batu Kawan, Penang
- **Coordinates:** 5.237826° N, 100.452277° E
- **Default load:** 700 kWh/month
- **Default tariff:** TNB Domestik (Rumah)
- **3D Model:** https://solar.limziyang.ml/static/models/video_7/3DModel.glb
- **GMap Measurement PNG:** https://solar.limziyang.ml/static/measurement/eco_horizon.png
- **Visible measurement on GMap PNG:** 14.60 m
- **Thumbnail:** https://solar.limziyang.ml/static/ECO_HORIZON.PNG
- **Direct simulator launch:** https://solar.limziyang.ml/simulator?model=/static/models/video_7/3DModel.glb&lat=5.237826&lng=100.452277&usage=700&tariff=domestic

---

## URL Schema

### Static asset paths
```
3D mesh:          https://solar.limziyang.ml/static/models/<model_id>/3DModel.glb
GMap measurement: https://solar.limziyang.ml/static/measurement/<name>.png
Thumbnail:        https://solar.limziyang.ml/static/<NAME>.<ext>
```

### Simulator deep-link
```
https://solar.limziyang.ml/simulator
  ?model=<model_url>
  &lat=<latitude>
  &lng=<longitude>
  &usage=<monthly_kWh>
  &tariff=<commercial_lv|domestic|commercial_mv>
```

`main.js` reads these query params on launch and pre-populates the setup wizard.

### Available tariff codes
| Code | TNB Tariff |
|---|---|
| `domestic` | Domestik (Rumah) — tiered residential |
| `commercial_lv` | Komersial Voltan Rendah — Commercial LV |
| `commercial_mv` | Komersial Voltan Sederhana — Commercial MV |
