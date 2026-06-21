FINENESS_POINTS = {
    "极细腻": 4,
    "细腻": 3,
    "一般": 2,
    "偏粗": 1,
}

GRADE_SPECIAL = "特级"
GRADE_FIRST = "一级"
GRADE_SECOND = "二级"


def fineness_points(fineness: str) -> int:
    return FINENESS_POINTS.get(fineness, 0)


def compute_score(transparency: int, fineness: str) -> int:
    return int(transparency) + fineness_points(fineness)


def compute_grade(transparency: int, fineness: str) -> str:
    score = compute_score(transparency, fineness)
    if score >= 12:
        return GRADE_SPECIAL
    if score >= 8:
        return GRADE_FIRST
    return GRADE_SECOND
