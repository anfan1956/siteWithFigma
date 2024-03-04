import json, uuid
import os
import re

from flask import render_template, redirect, url_for, request, jsonify, send_from_directory
from flask import abort

from app import app
from app.functions import images, parent, art_display, inv_set, dt_time_max, dt_delta
from app.functions import get_items_sorted, delivery_data
from app.data import sql_query as s
from app.send_sms import sms
from app.mails import fanfan_send_mail
from app.site_settings import allow_sms


@app.route('/')
def main():
    return redirect(url_for('basket'))


@app.route('/about')
def about():
    return render_template( 'about.html')


@app.route('/basket')
def basket():
    print(f"request.path: {request.path}, request.method: {request.method}")
    content = {
        "title": "КОРЗИНА",
        "parent": parent,
    }
    phone = request.cookies.get('phone')
    Session = request.cookies.get('Session')
    if phone or Session:
        sql = f"select web.delivery_addr_js_('{phone}')"
        # sql = f"select web.top_adr_('{phone}')"
        print(sql)
        addr_list = json.loads(s(sql))
        if request.method == 'GET':
            address = request.args.get("deliverTo")
            content['deliverTo'] = address
            content['addrData'] = addr_list
            print('flag 1')
    sqlParams = {
        'phone': phone,
        'Session': Session
    }
    sqlParams = json.dumps(sqlParams)
    sql = f"exec web.basketContent_consolidated_json_'{sqlParams}'"
    print(f"sql for basket:  {sql}")
    data = s(sql)
    data = json.loads(data)
    data_0 = data[0]
    print(data, data_0, ': printing data and data_0')
    basket_content = data_0.get('корзина')
    content['data'] = data
    sql = f"select cust.basket_totals_json('{sqlParams}')"
    print(sql)
    basket_totals = json.loads(s(sql))[0]
    totals = basket_totals.get('итого')
    if not basket_content:

        headers = list(data[0].keys())
        content['headers'] = headers
        content['data'] = data
        if basket_totals:
            content['totals'] = basket_totals
    else:
        content['basket_content'] = basket_content
    print(content)
    return render_template('basket.html', **content)


@app.route('/deliveryData', methods=['POST', 'GET'])
def deliveryData():
    print(f'request.method: "{request.method}", request.path: "{request.path}"')
    results = None
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        action = data[0].get('action')
        dataJson = json.dumps(data, ensure_ascii=False)
        print(f"json dumps: {dataJson}")
        print(f"action: {action}")
        if action == 'use':
            sql = f"exec web.address_register_json '{dataJson}'; "
            res = s(sql)
            print(f"web.address_register_json returns: {res}")
            phone = data[0].get('phone')
            return res
            # if phone:
            #     print(f"data[1]: {data[1]}")
            #     deliverTo = data[1].get('address')
            #     print(f"deliverTo: {deliverTo}")
            #     results = data[1]
    return results


@app.route("/delivery", methods=['GET', 'POST'])
@app.route("/delivery/<ticketid>", methods=['GET', 'POST'])
def delivery(ticketid=None):
    print(f'request method: "{request.method}", path: "{request.path}"')
    print(ticketid)
    del_data = ticketid if ticketid is None else delivery_data(ticketid)

    content = {
            "title": "Доставка",
            "del_data": del_data
            }
    print(f"delivery data: {delivery_data(ticketid)}")
    if request.method == 'POST':
        f = request.form
        # method = list(f.keys())[-1]
        # print(f"method:  {method}")
        args = ['address', 'ticketid', 'fio', 'phone']
        # ниже  - чтобы не переделывать sql процедуру, немного по индийски
        args_2 = ['ticketid', 'fio', 'phone', 'address']
        d = {a: request.form.get(a) for a in args}
        # print(d)
        new_ticketid = d['ticketid']
        phone = d['phone']
        d['phone'] = phone.replace(" ", "").replace("(", "").replace(")", "").replace("'", "").replace("+", "").replace("-", "")[-10:]
        val = ""
        for a in args:
            val += "'" + d[a] + "', "
        val = val[:-2]
        val_2 = ""
        for a in args_2:
            val_2 += "'" + d[a] + "', "
        val_2 = val_2[:-2]
        print(val_2)
        sql = "set nocount on; declare @note varchar(max); "
        sql = sql + f"exec web.delivery_register {val}, @note output; select @note;"
        print(sql)
        note = s(sql).strip("[]")
        note = json.loads(note)
        print(note, type(note))
        if 'fail' in note.keys():
            new_ticketid = ticketid if note['fail'] == 'logid does not exist' else new_ticketid
            content = {
                    # 'failed_ticket': new_ticketid,
                    'result': 'abort',
            }
            print(content['result'])
            return redirect(url_for('delivery', ticketid=new_ticketid))
        return redirect(url_for('main'))
    return render_template("delivery.html", **content)




@app.route('/home')
def home():
    carousel_folder = f"F:/Figma/figmaSiteJs/app/static/images/hp-carousel"
    image_folder = os.path.join('static', carousel_folder)  # Replace with your directory
    image_files = [f for f in os.listdir(image_folder) if f.endswith('.jpg')]  # Get all .jpg
    return render_template('home.html', images=image_files)


@app.route('/login')
def login():
    return render_template("login.html")


@app.route('/catalog')
def catalog():
    styles = art_display('/catalog', 0, False)
    styles = sorted(styles, key=lambda d: d['бренд'])
    brands = sorted({s['бренд'] for s in styles})
    cats = sorted({a['категория'] for a in art_display('/catalog', 0)})
    content = {"title": "Каталог товаров",
               "parent": parent,
               "styles": styles,
               "brands": brands,
               "cats": cats,
               }
    return render_template('catalog.html', **content)


@app.route('/product/<styleid>', methods=['GET', 'POST'])
def product(styleid):
    phone_number = request.cookies.get('phone')
    sql = f"select web.delivery_addr_js_('{phone_number}')"
    print(sql)
    addr_list = json.loads(s(sql))
    i = inv_set(styleid)[0]
    this_styleid = i.get('styleid')
    if this_styleid == 'not available':
        abort(404)
    print(request.path, request.method)
    sql = f"select web.product2_({styleid})"
    big_data = json.loads(s(sql))
    data = big_data[0]
    content = {
        "parent": parent,
        'addrData': addr_list,
        "data": data
    }
    return render_template('product.html', **content)


@app.route('/phone', methods=['POST'])
def phone():
    print(f"method: {request.method}, path: {request.path}")
    Session = request.cookies.get('Session')
    phone_cookie = request.cookies.get('phone')
    dt = dt_time_max()
    data = request.get_json()
    print(data)
    phone_number = data.get('phone')
    task = data.get('task')
    code = data.get('code')
    email_new = data.get('email')
    result = {'status': 'ok'}
    match task:
        case 'initiate session':
            response = jsonify(result)
            Session = str(uuid.uuid4())
            response.set_cookie("Session", Session, expires=dt)
            return response
        case 'get-sms-code':
            sql = f"set nocount on; declare @r int; exec @r = web.smsGenerate '{phone_number}'; select @r"

            result['code'] = str(s(sql))
            result['sms_sent'] = 'sms_sent'
            print(f'result: {result}')
            if allow_sms:
                sms(phone_number, result.get('code'))
            # response = jsonify(result)
            # return response
        case 'verify-sms-code':
            sql = f"select top 1 smsCode from web.sms_log where phone = '{phone_number}' order by logid desc"
            # print(sql)
            sms_orig = str(s(sql))
            print(f'sms_orig: {sms_orig}, sms_code: {code}')
            if sms_orig == code:
                sql = f"set nocount on; declare @note varchar(max); exec web.promoAllStyles_p {phone_number}, @note output; select @note"
                message = s(sql)
                print(f'message: {message}')
                if allow_sms:
                    sms(phone_number, message)
                sql = f"select cust.customer_mail('{phone_number}')"
                q_result = s(sql)
                # print(q_result)
                result = {'message': message, 'status': 'ok', 'email': q_result}
                sql = f"select cust.customer_prefs ('{phone_number}')"
                prefs = json.loads(s(sql))[0]
                # result = {'status': 'ok', 'email': q_result, 'sms_result': 'sms verified'}
                for p in prefs:
                    result[p] = prefs[p]
                print(result)
                print(result, 'should be sms verified')
                response = jsonify(result)
                response.set_cookie("phone", phone_number, expires=dt)
                if message != "сейчас промоакций нет":
                    promo = re.findall(r'\d{6}', message)[0]
                    response.set_cookie("promo", promo, expires=dt)
            else:
                response = {'status': 'error', 'message': 'неверный код'}
            return response
        case 'get-email-prefs':
            sql = f"select cust.customer_mail('{phone_cookie}')"
            q_result = s(sql)
            sql = f"select cust.customer_prefs ('{phone_cookie}')"
            prefs = json.loads(s(sql))[0]
            result = {'status': 'ok', 'email': q_result}
            for p in prefs:
                result[p] = prefs[p]
            # response = jsonify(result)
        case 'prefs-update':
            jsonData = json.dumps(data)
            print(jsonData)
            sql = f"exec cust.prefs_update '{jsonData}'"
            print(sql)
            print(s(sql))
            result['updated'] = True
            # response = jsonify(result)
        case 'get-email-code':
            if email_new == '':
                sql = f"cust.email_delete '{phone_number}'"
                # result['email_result'] = jsonify(s(sql))
                result['email_result'] = s(sql)
            else:
                sql = f"set nocount on; declare @r int; exec @r = web.emailGenerate '{email_new}'; select @r"
                code = str(s(sql))
                print(code)
                argv = {'code': code, 'To': email_new}
                email_sent = fanfan_send_mail(**argv)
                result['email_result'] = email_sent
        case 'verify-email':
            # email_code = data.get['code']
            sql = f"select top 1 emailCode from web.email_log where email = '{email_new}' order by logid desc"
            email_msg = str(s(sql))
            # print(email_msg)
            if email_msg == code:
                notes = True  # set temporarily will have to update with buttons later
                sql = f"exec cust.email_update '{phone_number}', '{email_new}', '{notes}'"
                # print(sql)
                result['email'] = email_new
                result['email_verified'] = s(sql)  # ______________________________________________________________________________________
                # print(f"email update result: {result}")  # __________________________________________________________
    response = jsonify(result)
    print(result, 'this is response')
    return response


@app.route('/imagesDir/<path:filename>')
def custom_static(filename):
    return send_from_directory(images, filename)


@app.route('/actions', methods=['POST', 'GET'])
def actions():
    print(f"request.path: {request.path}, request.method: {request.method}")
    data = request.get_json()
    print(data)
    task = data[0].get('procName')
    print(f'task: {task}')
    if task in ["insert", "remove", "purchase"]:
        arg = json.dumps(data)
        sql = f"exec web.basketAction_2 '{arg}'"
        print(f'sql for action: {task}:  {sql}')
        result = json.loads(s(sql))
        result[0]['status'] = 'ok'
        print(result)
        response = jsonify(result)
        success = result[0].get('success')
        # response['success'] = success
    return response


@app.route('/filters', methods=['POST', 'GET'])
def filters():
    data = request.get_json()
    result = {
        "brands": get_items_sorted(data),
        "status": "ok"
    }
    response = jsonify(result)
    return response
