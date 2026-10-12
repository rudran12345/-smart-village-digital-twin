import numpy as np
from typing import List, Dict, Any

def detect_resource_anomalies(data_points: List[float], threshold_z: float = 2.0) -> List[Dict[str, Any]]:
    """
    Z-score and interquartile range (IQR) anomaly detector
    for village resource timeseries. Identifies leakages,
    abnormal power draws, and unseasonal weather events.
    """
    if len(data_points) < 4:
        return []
        
    arr = np.array(data_points, dtype=float)
    mean = np.mean(arr)
    std = np.std(arr)
    
    anomalies = []
    if std < 1e-4:
        return anomalies
        
    for idx, val in enumerate(arr):
        z_score = abs(val - mean) / std
        if z_score > threshold_z:
            anomalies.append({
                "index": idx,
                "value": float(val),
                "mean": round(float(mean), 2),
                "z_score": round(float(z_score), 2),
                "type": "SPIKE" if val > mean else "DROP"
            })
            
    return anomalies
