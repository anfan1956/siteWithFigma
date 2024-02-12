import datetime
import json
import sys
import time
from datetime import timedelta

from app.data import sql_query as s, cn

images = 'T:/fanfan-weekend-2/app/static/images/parent'
parent = str(800)


def art_display(route, months, old=True):
    if old:
        sql = f"select inv.arrivals_json({months}, default, default )"
    else:
        sql = f"select inv.arrivals2_json({months}, default, default )"
    f_articles = json.loads(s(sql))
    arrivals = []
    match route:
        case '/main':
            key_filter = ['дата', 'dates', 'бренд', 'категория', 'пол', 'модель','артикул', 'цена','фото', 'промо_скидка']
        case '/catalog':
            key_filter = ['дата', 'dates', 'бренд', 'категория', 'пол', 'артикул','модель', 'цена', 'скидка', 'промо_скидка', 'фото']
        case _:
            key_filter = False
    if key_filter:
        for a in f_articles:
            filtered_arrivals = {k: a[k] for k in a if k in key_filter}
            arrivals.append(filtered_arrivals)
    else:
        arrivals = False
    return arrivals


def inv_set(styleid):
    sql = f"select inv.inv_set_forJSON({styleid})"
    cursor = cn().cursor()
    result = json.loads(cursor.execute(sql).fetchone()[0])
    cn().commit()
    cn().close()
    return result


def dt_time_max():
    """converts any datetime/date to new datetime with same date and time=23:59:59.999999 in local time """
    offset = time.timezone if (time.localtime().tm_isdst == 0) else time.altzone
    time_l = datetime.datetime.now()
    tm = datetime.datetime.combine(time_l, datetime.time.max)+datetime.timedelta(seconds=offset)
    return tm


def dt_delta(minutes):
    """converts dt for cookie to correct UTC"""
    dt = datetime.datetime.utcnow()
    return dt + timedelta(minutes=minutes)


def get_items_sorted(arg):
    alldata = art_display('/catalog', 0, False)
    gender = arg['gender']
    item = arg['item']
    if gender == 'female':
        f_brands = set(a.get(item) for a in alldata if a.get('пол') == 'ЖЕН')
    else:
        f_brands = set(a.get(item) for a in alldata if a.get('пол') == 'МУЖ')
    return sorted(f_brands)


def delivery_data(arg):
    result = None
    if arg is not None:
        sql = f"select web.ticket_address_({arg})"
        result = json.loads(s(sql))[0] if s(sql) is not None else None
    return result


if __name__ == '__main__':
    arr = art_display('/catalog', 0, False)
    arr = sorted(arr, key=lambda d: d['бренд'])
    print(arr)
    # # arr = json.dumps(arr, ensure_ascii=False)
    # brands = set()
    # for a in arr:
    #     if a.get('пол') == 'ЖЕН':
    #         brands.add(a.get('бренд'))
    # print(len(brands), sorted(brands))
    args = {"item": 'категория', "gender": 'male'}
    print(get_items_sorted(args))

