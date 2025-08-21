import json
import random

# 384차원 랜덤 벡터 생성
vector = [random.uniform(-1, 1) for _ in range(384)]

test_data = {
    "points": [
        {
            "id": 1,
            "vector": vector,
            "payload": {
                "section": "test",
                "title": "Test Point",
                "language": "en"
            }
        }
    ]
}

with open("test_point_384.json", "w") as f:
    json.dump(test_data, f, indent=2)

print("384차원 테스트 포인트 JSON 생성 완료")