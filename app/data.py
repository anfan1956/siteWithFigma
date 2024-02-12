from pyodbc import connect as cnn
from app.site_settings import active_server, PWD, Demo_server


def cn(demo=False):
    Server = active_server
    if demo:
        Server = Demo_server
        print(f"from cn: {Server}")
    con = cnn('Driver={ODBC Driver 17 for SQL Server};'
              f'Server={Server};'
              'Database=fanfan;'
              'UID=anfan;'
              f'PWD={PWD};')
    return con


def sql_query(args):
    con = cn()
    cursor = con.cursor()
    # print(args)
    cursor.execute(args)
    result = cursor.fetchone()[0]
    con.commit()
    con.close()
    return result


def sql_query(args):
    con = cn()
    cursor = con.cursor()
    # print(args)
    cursor.execute(args)
    result = cursor.fetchone()[0]
    con.commit()
    con.close()
    return result
