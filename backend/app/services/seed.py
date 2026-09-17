"""Seed demo family health data when a family is nearly empty."""

from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy.orm import Session

from app.db import models

AVATAR_FATHER = "https://lh3.googleusercontent.com/aida-public/AB6AXuBkrn2DPPgzH_zdwMQxmxE6aO4uURfcC5XgyW8_rqmwKdMzM06HQgbaFtegt72AwYlKbaukP5TMMCrl43BM9RFC7oMq4Yf6tmLfQ2pX2f1vyjWw1B--C-NQUq0BJooCIaERZEF1SUMaAY84gThV3iYPPvLn4OwJbHSAM_MzmAuWSv1e8O3NTGQyEtDMbKQOFSEiRAoeP97btMehF8VBOv8QtSAhDMFu9D4-gL3WvK3Nb-4zL0FB8BKW"
AVATAR_WAN = "https://lh3.googleusercontent.com/aida-public/AB6AXuDb-BMZuVkNnSEQssndoVQQ7ywhmIRyl92ccYbP5dlOFdk_UoDXgZjfSfCGeX9T4PY6SqK0exPqV7YGu6gw2spqYsDpgHWzwh4ZAx3Kx78p4eXw_TUUKXb6psqkxV-vxsZUXKVCHo2O1764irDJyuhAPYVWEE7MWqM3XNkFWdZK2SMNqfXYEG-qBdJTcfwRWBJl47GV4oQdYJEKc4cmqFwtX-VLWveFfRMzUMePEUb4Ql8sAYfPqGd4"
AVATAR_MOTHER = "https://lh3.googleusercontent.com/aida-public/AB6AXuCYq4UYGd5L8c3JBWWI4edI0IS_ZoA00b2jwQ5gOs_Yo6JczXI7fZ_Tv0lKx6ku4ZyrQR_7yKoPx--Xkr_pwWmwafKYmt_Z1pdpd_xGvVEkP2cwZaUpnil6w5URUUdVLthJ8GzzGQKNaPOK95UDehmkrpFx6d2Pxz54bhYn7ENuj9rLwaK0eapajfx3sr0waQPkeSye2EWvt-_KjlCL6CTII4iXPn6FEIefoHADHgjnRxwYR1skVTha"
AVATAR_SON = "https://lh3.googleusercontent.com/aida-public/AB6AXuDdnHOB85D706fuxxTKIPrqi61aOuPoV_2OOBsn762sED2uz7p5H6GtSN3tUJNTfP1cIltDq04TgA-UjuK8m_BW1rBFgVE7PisszZJ0cJuutzNPZStv03LTseoEj5ihIr3gUuCNfbROSMt4Rk9GZ9AoBFh8THNgYCeTiW8JFD6lkN4erchXOQIizRiAc424RbL9KF2IWcri7_r-vfoGzdCSwxmgImRRgUrlpToczxRI-BuE2EKOfOAi"


def family_needs_demo_seed(db: Session, family_id) -> bool:
    count = db.query(models.Member).filter(models.Member.family_id == family_id).count()
    return count <= 1


def seed_demo_family(db: Session, user: models.User) -> None:
    """Replace sparse family with full demo household data."""
    if not user.family_id:
        return
    if not family_needs_demo_seed(db, user.family_id):
        return

    family_id = user.family_id
    # Clear existing sparse members (cascade child rows)
    db.query(models.Member).filter(models.Member.family_id == family_id).delete()
    db.flush()

    user.display_name = "林婉"
    family = db.get(models.Family, family_id)
    if family:
        family.name = "林婉的家庭"

    father = models.Member(
        family_id=family_id,
        name="陈建国",
        nickname="父亲",
        relation="父亲",
        age=64,
        avatar=AVATAR_FATHER,
        status_text="需测血压",
        status_type="warning",
        blood_type="A型 (Rh阳性)",
        height=172,
        weight=68.5,
        chronic_conditions=["原发性高血压 (2级)"],
        allergies=["轻度青霉素过敏"],
        latest_vitals={
            "bloodPressure": {
                "systolic": 124,
                "diastolic": 82,
                "changeText": "-4 昨日",
                "status": "正常安稳",
                "history": [134, 130, 128, 129, 126, 128, 124],
                "measuredAt": "今日 07:15",
            },
            "bloodSugar": {
                "value": 5.8,
                "unit": "mmol/L",
                "status": "达标 · 餐前正常",
                "timing": "空腹",
            },
            "heartRate": {
                "value": 72,
                "unit": "次/分",
                "status": "节律规整 · 平稳",
                "rhythm": "窦性心律",
            },
        },
    )
    wan = models.Member(
        family_id=family_id,
        name="林婉",
        nickname="我",
        relation="本人",
        age=34,
        avatar=AVATAR_WAN,
        status_text="健康稳定",
        status_type="normal",
        blood_type="O型 (Rh阳性)",
        height=165,
        weight=52.0,
        chronic_conditions=[],
        allergies=[],
        latest_vitals={
            "bloodPressure": {
                "systolic": 112,
                "diastolic": 74,
                "changeText": "平稳",
                "status": "理想范围",
                "history": [115, 114, 112, 116, 113, 112, 112],
                "measuredAt": "昨日 21:00",
            },
            "sleep": {
                "score": 88,
                "duration": "7小时42分",
                "deepSleep": "2h10m",
                "status": "精力恢复充沛",
            },
            "heartRate": {
                "value": 68,
                "unit": "次/分",
                "status": "平稳",
                "rhythm": "窦性心律",
            },
        },
    )
    mother = models.Member(
        family_id=family_id,
        name="林秀英",
        nickname="母亲",
        relation="母亲",
        age=62,
        avatar=AVATAR_MOTHER,
        status_text="骨质关怀",
        status_type="normal",
        blood_type="B型 (Rh阳性)",
        height=160,
        weight=56.0,
        chronic_conditions=["轻度骨质疏松", "空腹血糖关注"],
        allergies=[],
        latest_vitals={
            "bloodPressure": {
                "systolic": 122,
                "diastolic": 78,
                "changeText": "正常",
                "status": "稳定",
                "history": [124, 121, 123, 120, 122, 125, 122],
                "measuredAt": "前天 08:00",
            },
            "bloodSugar": {
                "value": 5.6,
                "unit": "mmol/L",
                "status": "达标且平稳",
                "timing": "空腹标准范围 3.9 ~ 6.1",
            },
            "heartRate": {
                "value": 70,
                "unit": "次/分",
                "status": "正常",
                "rhythm": "平稳",
            },
        },
    )
    son = models.Member(
        family_id=family_id,
        name="陈睿睿",
        nickname="儿子",
        relation="儿子",
        age=4,
        avatar=AVATAR_SON,
        status_text="疫苗接种待办",
        status_type="info",
        blood_type="O型 (Rh阳性)",
        height=104,
        weight=16.5,
        chronic_conditions=[],
        allergies=[],
        latest_vitals={
            "bloodPressure": {
                "systolic": 95,
                "diastolic": 60,
                "changeText": "儿童正常",
                "status": "良好",
                "history": [94, 96, 95, 95, 96, 94, 95],
                "measuredAt": "昨日 19:30",
            },
            "temperature": {
                "value": 36.6,
                "unit": "℃",
                "status": "体温平稳",
                "timeAgo": "4小时前",
            },
        },
    )
    db.add_all([father, wan, mother, son])
    db.flush()

    med1 = models.Medication(
        member_id=father.id,
        name="苯磺酸氨氯地平片 (络活喜)",
        generic_name="苯磺酸氨氯地平片",
        dosage="5mg / 次",
        dosage_form="片剂 (片)",
        frequency="每日 1 次",
        time_slot="08:00",
        time_label="晨起餐后 30 分钟",
        meal_timing="餐后半小时",
        tags=["高血压", "心脑调理"],
        notes="温开水送服，服药期间避免饮用西柚汁",
        stock_current=30,
        stock_warning=7,
        schedule_mode="continuous",
        start_date="2024-10-25",
        duration="长期遵医嘱",
    )
    med2 = models.Medication(
        member_id=son.id,
        name="儿童复合维生素滴剂",
        generic_name="复合维生素营养滴剂",
        dosage="1ml",
        dosage_form="滴剂 (ml)",
        frequency="每日 1 次",
        time_slot="07:45",
        time_label="早餐温水兑服",
        meal_timing="随餐服用",
        tags=["日常维生素", "儿童成长"],
        notes="开封后密封冷藏避光",
        stock_current=45,
        stock_warning=10,
        schedule_mode="continuous",
        start_date="2024-11-01",
        duration="按需补充",
    )
    med3 = models.Medication(
        member_id=father.id,
        name="立普妥 (阿托伐他汀钙片)",
        generic_name="阿托伐他汀钙片",
        dosage="20mg / 次",
        dosage_form="片剂 (片)",
        frequency="每日 1 次",
        time_slot="21:00",
        time_label="每晚睡前 1 片",
        meal_timing="睡前服用",
        tags=["高血脂", "斑块稳定"],
        notes="定期监测肝功能与肌酸激酶",
        stock_current=24,
        stock_warning=7,
        schedule_mode="continuous",
        start_date="2024-10-20",
        duration="长期遵医嘱",
    )
    med4 = models.Medication(
        member_id=mother.id,
        name="碳酸钙D3片 (钙尔奇)",
        generic_name="碳酸钙D3片",
        dosage="600mg / 次",
        dosage_form="咀嚼片",
        frequency="每日 1 次",
        time_slot="12:30",
        time_label="午餐后咀嚼服用",
        meal_timing="餐后半小时",
        tags=["骨质关怀", "补钙日常"],
        notes="多饮水，适度晒太阳促进吸收",
        stock_current=60,
        stock_warning=15,
        schedule_mode="continuous",
        start_date="2024-09-15",
        duration="长期遵医嘱",
    )
    db.add_all([med1, med2, med3, med4])
    db.flush()

    today = date.today()
    now = datetime.now(timezone.utc)
    db.add_all(
        [
            models.MedicationIntake(medication_id=med2.id, taken_date=today, taken_at=now),
            models.MedicationIntake(medication_id=med4.id, taken_date=today, taken_at=now),
        ]
    )

    db.add_all(
        [
            models.MedicalRecord(
                member_id=father.id,
                hospital="四川大学华西医院",
                department="心血管内科",
                visit_date="2025年4月12日",
                doctor="门诊复查随访 · 副主任医师",
                status="已完成复诊",
                complaint="近期偶有轻微血压波动，特来门诊复查随访与处方调配。",
                diagnosis="高血压病 2级 很高危 (靶器官受累稳定，目前控制良好)",
                orders="继续按原剂量维持用药；低盐低脂饮食，早晚温和散步。",
            ),
            models.MedicalRecord(
                member_id=father.id,
                hospital="成都市第一人民医院",
                department="心血管专科门诊",
                visit_date="2025年1月10日",
                doctor="季度常规复查 · 主任医师",
                status="历史随访",
                complaint="冬季晨起血压轻微偏高 (142/90)，偶感头昏，前来调整降压方案。",
                diagnosis="原发性高血压 2级 (建议调整晨起服药时段，预约24小时动态心电监测)",
                orders="改早晨7:30温水送服络活喜；加强低钠饮食，2周后回传家庭自测血压。",
            ),
            models.MedicalRecord(
                member_id=son.id,
                hospital="高新区第二社区卫生服务中心",
                department="儿保科 / 预防接种门诊",
                visit_date="2025年2月20日",
                doctor="儿童生长发育评估 · 主治医师",
                status="已完成复诊",
                complaint="满42个月健康体检及微量元素生长曲线随访。",
                diagnosis="生长发育各项指标处于同龄前75百分位，身心活泼正常。",
                orders="保证奶量400ml/日，继续补充维生素D3，注意防龋齿。",
            ),
        ]
    )

    db.add_all(
        [
            models.LabReport(
                member_id=father.id,
                title="全套生化与血脂化验报告",
                report_date="2025年4月12日",
                lab="华西检验中心",
                status_tag="指标正常",
                status_type="success",
                source_file_url="",
                metrics=[
                    {"name": "空腹血糖 (FBG)", "value": "5.62 mmol/L", "reference": "3.90 ~ 6.10", "isNormal": True},
                    {"name": "总胆固醇 (TC)", "value": "4.21 mmol/L", "reference": "2.80 ~ 5.18", "isNormal": True},
                    {"name": "低密度脂蛋白 (LDL-C)", "value": "1.98 mmol/L", "reference": "< 2.60 (心血管达标)", "isNormal": True},
                    {"name": "谷丙转氨酶 (ALT)", "value": "22 U/L", "reference": "9 ~ 50", "isNormal": True},
                    {"name": "血肌酐 (Cr)", "value": "78 μmol/L", "reference": "53 ~ 106", "isNormal": True},
                ],
            ),
            models.LabReport(
                member_id=father.id,
                title="24小时动态心电监测 (动态心电图)",
                report_date="2025年1月5日",
                lab="心电诊断室",
                status_tag="良性无缺血",
                status_type="success",
                source_file_url="",
                metrics=[
                    {"name": "总心搏数", "value": "102,480 次", "reference": "正常范围", "isNormal": True},
                    {"name": "平均心率", "value": "71 次/分", "reference": "60 ~ 100", "isNormal": True},
                    {"name": "最高心率", "value": "112 次/分 (活动时)", "reference": "生理反应", "isNormal": True},
                    {"name": "ST-T 改变", "value": "未见明显缺血型下移", "reference": "阴性", "isNormal": True},
                ],
            ),
            models.LabReport(
                member_id=mother.id,
                title="双能X射线骨密度测定 (DXA报告)",
                report_date="2024年11月18日",
                lab="省骨科医院影像中心",
                status_tag="轻度骨量减少",
                status_type="warning",
                source_file_url="",
                metrics=[
                    {"name": "腰椎 L1-L4 T值", "value": "-1.6", "reference": "> -1.0 正常", "isNormal": False},
                    {"name": "股骨颈 T值", "value": "-1.4", "reference": "> -1.0 正常", "isNormal": False},
                    {"name": "Z值", "value": "+0.2", "reference": "同龄匹配良好", "isNormal": True},
                ],
            ),
        ]
    )

    base = date.today()
    db.add_all(
        [
            models.MedicalSchedule(
                member_id=father.id,
                title="陈建国 · 心内科门诊复查",
                type="clinic",
                scheduled_at=datetime.combine(base + timedelta(days=5), time(9, 30), tzinfo=timezone.utc),
                location="华西医院门诊部 3楼 4诊室",
                department="心血管内科",
                doctor="周怀远 主任医师",
                tags=["需空腹 8 小时", "带齐往期心电图", "停用晨起降压药"],
                notes="预约挂号单已自动存入电子医保凭证，就医前请勿剧烈运动。",
                theme_color="primary",
                reminder_set=True,
            ),
            models.MedicalSchedule(
                member_id=son.id,
                title="陈睿睿 · 4周岁疫苗接种",
                type="vaccine",
                scheduled_at=datetime.combine(base + timedelta(days=24), time(10, 15), tzinfo=timezone.utc),
                location="高新区桂溪街道社区卫生服务中心 2楼预防接种室",
                department="计免接种门诊",
                doctor="接种护士 李婷",
                tags=["接种日前测体温", "携带儿童预防接种证", "接种后留观30分"],
                notes="接种前一日请测量体温，确保无感冒发热征兆。",
                theme_color="tertiary",
                reminder_set=True,
            ),
            models.MedicalSchedule(
                member_id=mother.id,
                title="林秀英 · 眼科常规眼底与眼压筛查",
                type="followup",
                scheduled_at=datetime.combine(base + timedelta(days=32), time(14, 30), tzinfo=timezone.utc),
                location="四川大学华西第四医院 门诊2楼 眼底病诊疗区",
                department="眼科中心",
                doctor="张晓芬 副主任医师",
                tags=["需散瞳勿自驾", "携带既往验光单", "准备墨镜护眼"],
                notes="散瞳后4-6小时视物模糊属于正常反应。",
                theme_color="primary",
                reminder_set=False,
            ),
            models.MedicalSchedule(
                member_id=wan.id,
                title="林婉 · 年度全面深度健康体检",
                type="checkup",
                scheduled_at=datetime.combine(base + timedelta(days=49), time(8, 0), tzinfo=timezone.utc),
                location="美年大健康旗舰奥亚体检中心 5层",
                department="健康管理中心",
                doctor="全科主检医师组",
                tags=["禁食水10小时", "穿着宽松无金属衣物", "避开生理期"],
                notes="含头颅磁共振、甲状腺彩超、胃功能四项与乳腺钼靶。",
                theme_color="primary",
                reminder_set=True,
            ),
        ]
    )

    db.add_all(
        [
            models.Notification(
                user_id=user.id,
                member_id=father.id,
                title="父亲晨间降压药待服提醒",
                body="监测到早晨静息心率略有波动，请及时提醒父亲温开水送服络活喜。",
                type="warning",
                action_type="remind-father",
                action_label="一键呼叫提醒",
                action_payload={},
                is_read=False,
            ),
            models.Notification(
                user_id=user.id,
                member_id=father.id,
                title="华西医院门诊复查随访日程",
                body="心内科复查前需空腹8小时，请提前准备过往心电图报告单。",
                type="info",
                action_type="view-schedule",
                action_label="查看随访日程",
                action_payload={},
                is_read=False,
            ),
        ]
    )

    db.commit()
    db.refresh(user)
