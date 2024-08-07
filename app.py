from flask import Flask, jsonify, request, render_template, redirect, url_for, flash, session, send_file
from linkedin_api import Linkedin
from openai import OpenAI
import os
import io
from dotenv import load_dotenv
from flask_session import Session
from flask_cors import CORS
from urllib.parse import quote
import pandas as pd

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
CORS(app)

@app.route('/')
def index():
    return render_template('new.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    linkedin_username = data.get('email')
    linkedin_password = data.get('password')

    if not linkedin_username or not linkedin_password:
        return jsonify(status="error", message="Username and password are required."), 400

    # Store LinkedIn credentials in the session
    session['LINKEDIN_USERNAME'] = linkedin_username
    print(linkedin_username, linkedin_password)
    session['LINKEDIN_PASSWORD'] = linkedin_password

    return jsonify(status="success", message="Logged in successfully."), 200

@app.route('/group')
def group_base():
    return render_template('groups.html')

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    business_idea = data.get('business_idea')
    keyword = quote(business_idea)
    print(keyword)
    countries = data.get('country')
    industry = data.get('industry')
    connection = data.get('connection')
    print(connection)

    # Fetch credentials from session
    linkedin_username = data.get('email')
    
    print(linkedin_username)
    linkedin_password = data.get('password')
    print(linkedin_password)

    if not linkedin_username or not linkedin_password:
        return jsonify(status="error", message="User is not authenticated."), 401

    api = Linkedin(linkedin_username, linkedin_password)
    
    users = api.search_people(keyword, limit=3, industries=industry, regions=countries, network_depths=connection, include_private_profiles=False)
    print(users)

    client = OpenAI()
    user_message_pairs = []

    for user in users:
        user_name = user['name']
        id = user['urn_id']
        jobtitle = user['jobtitle']
        navigationUrl = user['navigationUrl']
        response = client.completions.create(
            model="gpt-3.5-turbo-instruct",
            prompt=f'Generate a message for a potential LinkedIn connection. My name is Ayush Kumar. '
                   f"Address the user by their first name {user_name} and mention the details of business idea {business_idea}. Please do not use any special characters like ** or ""\n\n",
            max_tokens=400
        )
        message = response.choices[0].text.strip()
        user_message_pairs.append({'name': user_name, 'id': id, 'jobtitle': jobtitle, 'navigationUrl' : navigationUrl, 'message': message})

    return jsonify(status="success",  user_message_pairs=user_message_pairs)

@app.route('/results')
def results():
    business_idea = session.get('business_idea')
    print(business_idea)
    user_message_pairs = session.get('user_message_pairs')

    if not all([business_idea, user_message_pairs]):
        return redirect(url_for('index'))

    return render_template('results.html', business_idea=business_idea, user_message_pairs=user_message_pairs)

@app.route('/groups', methods=['POST'])
def group():
    data = request.get_json()
    business_idea = data.get('business_idea')
    print(business_idea)

    # Fetch credentials from session
    linkedin_username = session.get('LINKEDIN_USERNAME')
    linkedin_password = session.get('LINKEDIN_PASSWORD')

    if not linkedin_username or not linkedin_password:
        return jsonify(status="error", message="User is not authenticated."), 401

    api = Linkedin(linkedin_username, linkedin_password)
    users = api.search_groups(business_idea, limit=1)
    print(users)

    return jsonify(status="success", users=users)

@app.route('/members', methods=['POST'])
def group_members():
    data = request.json
    urnId = data.get('urnID')

    # Fetch credentials from session
    linkedin_username = session.get('LINKEDIN_USERNAME')
    linkedin_password = session.get('LINKEDIN_PASSWORD')

    if not linkedin_username or not linkedin_password:
        return jsonify(status="error", message="User is not authenticated."), 401

    api = Linkedin(linkedin_username, linkedin_password)
    members = api.fetch_group_members(urn_id=urnId, start=0, count=10)
    
    print(members)
    
    return jsonify(members)

@app.route('/group-results')
def group_results():
    return render_template('groupresults.html')

@app.route('/send_messages', methods=['POST'])
def send_messages():
    try:
        # Parse JSON data from the request
        data = request.get_json()
        print(data)
        if not data:
            return jsonify(status="error", message="Invalid input data."), 400
        linkedin_username = data.get('email')
        linkedin_password = data.get('password')
        messages = data.get('messages')

        if not linkedin_username or not linkedin_password:
            return jsonify(status="error", message="LinkedIn credentials are missing."), 401

        if not messages:
            return jsonify(status="error", message="No messages to send."), 400

        api = Linkedin(linkedin_username, linkedin_password)

        for message_data in messages:
            user_id = message_data.get('id')
            message = message_data.get('message')
            if user_id and message:
                api.send_message(recipients=[user_id], message_body=message)

        return jsonify(status="success", message="Messages sent successfully."), 200
    except Exception as e:
        return jsonify(status="error", message=str(e)), 500


@app.route('/send_connection_requests', methods=['POST'])
def send_connection_requests():
    data = request.get_json()
    connections = data.get('results')
    print(connections)
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify(status="error", message="User is not authenticated."), 401

    # Authenticate with LinkedIn
    api = Linkedin(email, password)
    
    # Send connection requests
    for connection in connections:
        api.add_connection(connection['id'])

    # Create a DataFrame from the received connections
    df = pd.DataFrame(connections, columns=['name', 'jobtitle', 'profileLink'])
    
    sheet_name = f'Connections_{email}'[:31]

    # Save DataFrame to a bytes buffer as an Excel file
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name=sheet_name)
    output.seek(0)

    return send_file(output, download_name=f'connections_{email}.xlsx', as_attachment=True), 200
if __name__ == '__main__':
    app.run(debug=True)
