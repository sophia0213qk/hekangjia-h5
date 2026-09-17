-- 禾康家演示数据：为已有家庭写入与前端 mock 对齐的成员/用药/病历/化验/日程/通知
-- 用法: docker exec -i hekang-postgres psql -U hekang -d hekang < backend/scripts/seed_demo.sql

BEGIN;

-- 清理演示业务数据（保留 users / families / sms_codes）
TRUNCATE medication_intakes, medications, medical_records, lab_reports, schedules, notifications, vital_records, members RESTART IDENTITY CASCADE;

DO $$
DECLARE
  f RECORD;
  mid_father UUID;
  mid_wan UUID;
  mid_mother UUID;
  mid_son UUID;
  med1 UUID;
  med2 UUID;
  med3 UUID;
  med4 UUID;
BEGIN
  FOR f IN SELECT id AS family_id, owner_user_id FROM families LOOP
    mid_father := gen_random_uuid();
    mid_wan := gen_random_uuid();
    mid_mother := gen_random_uuid();
    mid_son := gen_random_uuid();
    med1 := gen_random_uuid();
    med2 := gen_random_uuid();
    med3 := gen_random_uuid();
    med4 := gen_random_uuid();

    -- 更新用户展示名为林婉（演示）
    UPDATE users
    SET display_name = '林婉'
    WHERE family_id = f.family_id;

    UPDATE families
    SET name = '林婉的家庭'
    WHERE id = f.family_id;

    INSERT INTO members (
      id, family_id, name, nickname, relation, age, avatar,
      status_text, status_type, blood_type, height, weight,
      chronic_conditions, allergies, latest_vitals
    ) VALUES
    (
      mid_father, f.family_id, '陈建国', '父亲', '父亲', 64,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBkrn2DPPgzH_zdwMQxmxE6aO4uURfcC5XgyW8_rqmwKdMzM06HQgbaFtegt72AwYlKbaukP5TMMCrl43BM9RFC7oMq4Yf6tmLfQ2pX2f1vyjWw1B--C-NQUq0BJooCIaERZEF1SUMaAY84gThV3iYPPvLn4OwJbHSAM_MzmAuWSv1e8O3NTGQyEtDMbKQOFSEiRAoeP97btMehF8VBOv8QtSAhDMFu9D4-gL3WvK3Nb-4zL0FB8BKW',
      '需测血压', 'warning', 'A型 (Rh阳性)', 172, 68.5,
      '["原发性高血压 (2级)"]'::jsonb,
      '["轻度青霉素过敏"]'::jsonb,
      '{"bloodPressure":{"systolic":124,"diastolic":82,"changeText":"-4 昨日","status":"正常安稳","history":[134,130,128,129,126,128,124],"measuredAt":"今日 07:15"},"bloodSugar":{"value":5.8,"unit":"mmol/L","status":"达标 · 餐前正常","timing":"空腹"},"heartRate":{"value":72,"unit":"次/分","status":"节律规整 · 平稳","rhythm":"窦性心律"}}'::jsonb
    ),
    (
      mid_wan, f.family_id, '林婉', '我', '本人', 34,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDb-BMZuVkNnSEQssndoVQQ7ywhmIRyl92ccYbP5dlOFdk_UoDXgZjfSfCGeX9T4PY6SqK0exPqV7YGu6gw2spqYsDpgHWzwh4ZAx3Kx78p4eXw_TUUKXb6psqkxV-vxsZUXKVCHo2O1764irDJyuhAPYVWEE7MWqM3XNkFWdZK2SMNqfXYEG-qBdJTcfwRWBJl47GV4oQdYJEKc4cmqFwtX-VLWveFfRMzUMePEUb4Ql8sAYfPqGd4',
      '健康稳定', 'normal', 'O型 (Rh阳性)', 165, 52.0,
      '[]'::jsonb, '[]'::jsonb,
      '{"bloodPressure":{"systolic":112,"diastolic":74,"changeText":"平稳","status":"理想范围","history":[115,114,112,116,113,112,112],"measuredAt":"昨日 21:00"},"sleep":{"score":88,"duration":"7小时42分","deepSleep":"2h10m","status":"精力恢复充沛"},"heartRate":{"value":68,"unit":"次/分","status":"平稳","rhythm":"窦性心律"}}'::jsonb
    ),
    (
      mid_mother, f.family_id, '林秀英', '母亲', '母亲', 62,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCYq4UYGd5L8c3JBWWI4edI0IS_ZoA00b2jwQ5gOs_Yo6JczXI7fZ_Tv0lKx6ku4ZyrQR_7yKoPx--Xkr_pwWmwafKYmt_Z1pdpd_xGvVEkP2cwZaUpnil6w5URUUdVLthJ8GzzGQKNaPOK95UDehmkrpFx6d2Pxz54bhYn7ENuj9rLwaK0eapajfx3sr0waQPkeSye2EWvt-_KjlCL6CTII4iXPn6FEIefoHADHgjnRxwYR1skVTha',
      '骨质关怀', 'normal', 'B型 (Rh阳性)', 160, 56.0,
      '["轻度骨质疏松","空腹血糖关注"]'::jsonb, '[]'::jsonb,
      '{"bloodPressure":{"systolic":122,"diastolic":78,"changeText":"正常","status":"稳定","history":[124,121,123,120,122,125,122],"measuredAt":"前天 08:00"},"bloodSugar":{"value":5.6,"unit":"mmol/L","status":"达标且平稳","timing":"空腹标准范围 3.9 ~ 6.1"},"heartRate":{"value":70,"unit":"次/分","status":"正常","rhythm":"平稳"}}'::jsonb
    ),
    (
      mid_son, f.family_id, '陈睿睿', '儿子', '儿子', 4,
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDdnHOB85D706fuxxTKIPrqi61aOuPoV_2OOBsn762sED2uz7p5H6GtSN3tUJNTfP1cIltDq04TgA-UjuK8m_BW1rBFgVE7PisszZJ0cJuutzNPZStv03LTseoEj5ihIr3gUuCNfbROSMt4Rk9GZ9AoBFh8THNgYCeTiW8JFD6lkN4erchXOQIizRiAc424RbL9KF2IWcri7_r-vfoGzdCSwxmgImRRgUrlpToczxRI-BuE2EKOfOAi',
      '疫苗接种待办', 'info', 'O型 (Rh阳性)', 104, 16.5,
      '[]'::jsonb, '[]'::jsonb,
      '{"bloodPressure":{"systolic":95,"diastolic":60,"changeText":"儿童正常","status":"良好","history":[94,96,95,95,96,94,95],"measuredAt":"昨日 19:30"},"temperature":{"value":36.6,"unit":"℃","status":"体温平稳","timeAgo":"4小时前"}}'::jsonb
    );

    INSERT INTO medications (
      id, member_id, name, generic_name, dosage, dosage_form, frequency,
      time_slot, time_label, meal_timing, tags, notes,
      stock_current, stock_warning, schedule_mode, start_date, duration, is_active
    ) VALUES
    (med1, mid_father, '苯磺酸氨氯地平片 (络活喜)', '苯磺酸氨氯地平片', '5mg / 次', '片剂 (片)', '每日 1 次',
     '08:00', '晨起餐后 30 分钟', '餐后半小时', '["高血压","心脑调理"]'::jsonb,
     '温开水送服，服药期间避免饮用西柚汁', 30, 7, 'continuous', '2024-10-25', '长期遵医嘱', true),
    (med2, mid_son, '儿童复合维生素滴剂', '复合维生素营养滴剂', '1ml', '滴剂 (ml)', '每日 1 次',
     '07:45', '早餐温水兑服', '随餐服用', '["日常维生素","儿童成长"]'::jsonb,
     '开封后密封冷藏避光', 45, 10, 'continuous', '2024-11-01', '按需补充', true),
    (med3, mid_father, '立普妥 (阿托伐他汀钙片)', '阿托伐他汀钙片', '20mg / 次', '片剂 (片)', '每日 1 次',
     '21:00', '每晚睡前 1 片', '睡前服用', '["高血脂","斑块稳定"]'::jsonb,
     '定期监测肝功能与肌酸激酶', 24, 7, 'continuous', '2024-10-20', '长期遵医嘱', true),
    (med4, mid_mother, '碳酸钙D3片 (钙尔奇)', '碳酸钙D3片', '600mg / 次', '咀嚼片', '每日 1 次',
     '12:30', '午餐后咀嚼服用', '餐后半小时', '["骨质关怀","补钙日常"]'::jsonb,
     '多饮水，适度晒太阳促进吸收', 60, 15, 'continuous', '2024-09-15', '长期遵医嘱', true);

    -- 今日已服：儿子维生素、母亲钙片
    INSERT INTO medication_intakes (id, medication_id, taken_date, taken_at) VALUES
    (gen_random_uuid(), med2, CURRENT_DATE, CURRENT_TIMESTAMP),
    (gen_random_uuid(), med4, CURRENT_DATE, CURRENT_TIMESTAMP);

    INSERT INTO medical_records (
      id, member_id, hospital, department, visit_date, doctor, status, complaint, diagnosis, orders
    ) VALUES
    (gen_random_uuid(), mid_father, '四川大学华西医院', '心血管内科', '2025年4月12日',
     '门诊复查随访 · 副主任医师', '已完成复诊',
     '近期偶有轻微血压波动，特来门诊复查随访与处方调配。',
     '高血压病 2级 很高危 (靶器官受累稳定，目前控制良好)',
     '继续按原剂量维持用药；低盐低脂饮食，早晚温和散步。'),
    (gen_random_uuid(), mid_father, '成都市第一人民医院', '心血管专科门诊', '2025年1月10日',
     '季度常规复查 · 主任医师', '历史随访',
     '冬季晨起血压轻微偏高 (142/90)，偶感头昏，前来调整降压方案。',
     '原发性高血压 2级 (建议调整晨起服药时段，预约24小时动态心电监测)',
     '改早晨7:30温水送服络活喜；加强低钠饮食，2周后回传家庭自测血压。'),
    (gen_random_uuid(), mid_son, '高新区第二社区卫生服务中心', '儿保科 / 预防接种门诊', '2025年2月20日',
     '儿童生长发育评估 · 主治医师', '已完成复诊',
     '满42个月健康体检及微量元素生长曲线随访。',
     '生长发育各项指标处于同龄前75百分位，身心活泼正常。',
     '保证奶量400ml/日，继续补充维生素D3，注意防龋齿。');

    INSERT INTO lab_reports (
      id, member_id, title, report_date, lab, status_tag, status_type, source_file_url, metrics
    ) VALUES
    (gen_random_uuid(), mid_father, '全套生化与血脂化验报告', '2025年4月12日', '华西检验中心', '指标正常', 'success', '',
     '[{"name":"空腹血糖 (FBG)","value":"5.62 mmol/L","reference":"3.90 ~ 6.10","isNormal":true},{"name":"总胆固醇 (TC)","value":"4.21 mmol/L","reference":"2.80 ~ 5.18","isNormal":true},{"name":"低密度脂蛋白 (LDL-C)","value":"1.98 mmol/L","reference":"< 2.60 (心血管达标)","isNormal":true},{"name":"谷丙转氨酶 (ALT)","value":"22 U/L","reference":"9 ~ 50","isNormal":true},{"name":"血肌酐 (Cr)","value":"78 μmol/L","reference":"53 ~ 106","isNormal":true}]'::jsonb),
    (gen_random_uuid(), mid_father, '24小时动态心电监测 (动态心电图)', '2025年1月5日', '心电诊断室', '良性无缺血', 'success', '',
     '[{"name":"总心搏数","value":"102,480 次","reference":"正常范围","isNormal":true},{"name":"平均心率","value":"71 次/分","reference":"60 ~ 100","isNormal":true},{"name":"最高心率","value":"112 次/分 (活动时)","reference":"生理反应","isNormal":true},{"name":"ST-T 改变","value":"未见明显缺血型下移","reference":"阴性","isNormal":true}]'::jsonb),
    (gen_random_uuid(), mid_mother, '双能X射线骨密度测定 (DXA报告)', '2024年11月18日', '省骨科医院影像中心', '轻度骨量减少', 'warning', '',
     '[{"name":"腰椎 L1-L4 T值","value":"-1.6","reference":"> -1.0 正常","isNormal":false},{"name":"股骨颈 T值","value":"-1.4","reference":"> -1.0 正常","isNormal":false},{"name":"Z值","value":"+0.2","reference":"同龄匹配良好","isNormal":true}]'::jsonb);

    INSERT INTO schedules (
      id, member_id, title, type, scheduled_at, location, department, doctor,
      tags, notes, theme_color, is_completed, reminder_set
    ) VALUES
    (gen_random_uuid(), mid_father, '陈建国 · 心内科门诊复查', 'clinic',
     (CURRENT_DATE + INTERVAL '5 days') + TIME '09:30',
     '华西医院门诊部 3楼 4诊室', '心血管内科', '周怀远 主任医师',
     '["需空腹 8 小时","带齐往期心电图","停用晨起降压药"]'::jsonb,
     '预约挂号单已自动存入电子医保凭证，就医前请勿剧烈运动，现场携带既往动态心电图报告。',
     'primary', false, true),
    (gen_random_uuid(), mid_son, '陈睿睿 · 4周岁疫苗接种', 'vaccine',
     (CURRENT_DATE + INTERVAL '24 days') + TIME '10:15',
     '高新区桂溪街道社区卫生服务中心 2楼预防接种室', '计免接种门诊', '接种护士 李婷',
     '["接种日前测体温","携带儿童预防接种证","接种后留观30分"]'::jsonb,
     '接种前一日请测量体温，确保无感冒发热征兆；接种后在休息区观察30分钟无不适方可离院。',
     'tertiary', false, true),
    (gen_random_uuid(), mid_mother, '林秀英 · 眼科常规眼底与眼压筛查', 'followup',
     (CURRENT_DATE + INTERVAL '32 days') + TIME '14:30',
     '四川大学华西第四医院 门诊2楼 眼底病诊疗区', '眼科中心', '张晓芬 副主任医师',
     '["需散瞳勿自驾","携带既往验光单","准备墨镜护眼"]'::jsonb,
     '散瞳后4-6小时视物模糊属于正常反应，就诊当天建议家属陪同并佩戴墨镜。',
     'primary', false, false),
    (gen_random_uuid(), mid_wan, '林婉 · 年度全面深度健康体检', 'checkup',
     (CURRENT_DATE + INTERVAL '49 days') + TIME '08:00',
     '美年大健康旗舰奥亚体检中心 5层', '健康管理中心', '全科主检医师组',
     '["禁食水10小时","穿着宽松无金属衣物","避开生理期"]'::jsonb,
     '含头颅磁共振、甲状腺彩超、胃功能四项与乳腺钼靶，体检前三日饮食清淡少油腻。',
     'primary', false, true);

    -- 通知（绑到家庭 owner；若无 owner 则绑该家庭下任意用户）
    INSERT INTO notifications (
      id, user_id, member_id, title, body, type, action_type, action_label, action_payload, is_read
    )
    SELECT
      gen_random_uuid(),
      u.id,
      mid_father,
      '父亲晨间降压药待服提醒',
      '监测到早晨静息心率略有波动，请及时提醒父亲温开水送服络活喜。',
      'warning',
      'remind-father',
      '一键呼叫提醒',
      '{}'::jsonb,
      false
    FROM users u
    WHERE u.family_id = f.family_id
    LIMIT 1;

    INSERT INTO notifications (
      id, user_id, member_id, title, body, type, action_type, action_label, action_payload, is_read
    )
    SELECT
      gen_random_uuid(),
      u.id,
      mid_father,
      '华西医院门诊复查随访日程',
      '心内科复查前需空腹8小时，请提前准备过往心电图报告单。',
      'info',
      'view-schedule',
      '查看随访日程',
      '{}'::jsonb,
      false
    FROM users u
    WHERE u.family_id = f.family_id
    LIMIT 1;

  END LOOP;
END $$;

COMMIT;

-- 汇总
SELECT 'members' AS tbl, count(*) FROM members
UNION ALL SELECT 'medications', count(*) FROM medications
UNION ALL SELECT 'medical_records', count(*) FROM medical_records
UNION ALL SELECT 'lab_reports', count(*) FROM lab_reports
UNION ALL SELECT 'schedules', count(*) FROM schedules
UNION ALL SELECT 'notifications', count(*) FROM notifications
UNION ALL SELECT 'medication_intakes', count(*) FROM medication_intakes;
