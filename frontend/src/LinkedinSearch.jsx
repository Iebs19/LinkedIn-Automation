import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveAs } from 'file-saver';

const LinkedInSearch = () => {
    const [businessIdea, setBusinessIdea] = useState('');
    const [template, setTemplate] = useState('');
    const [selectedIndustries, setSelectedIndustries] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedConnections, setSelectedConnections] = useState([]);
    const [results, setResults] = useState([]);
    const [isCountryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [isIndustryDropdownOpen, setIndustryDropdownOpen] = useState(false);
    const [isConnectionDropdownOpen, setConnectionDropdownOpen] = useState(false);

    const handleCheckboxChange = (setter) => (event) => {
        const value = event.target.value;
        setter(prev =>
            prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
    };

    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            business_idea: businessIdea,
            industry: selectedIndustries,
            country: selectedCountries,
            connection: selectedConnections,
            email: email,
            password: password,
        };

        try {
            const response = await fetch('http://localhost:5000/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success') {
                    setResults(result.user_message_pairs);
                } else {
                    alert('Error occurred: ' + result.message);
                }
            } else {
                alert('Error occurred: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error in POST request:', error);
            alert('An error occurred while processing your request.');
        }
    };

    const handleSendMessages = async (event) => {
        event.preventDefault();
        const selectedMessages = Array.from(event.target.elements)
            .filter(el => el.type === 'checkbox' && el.checked && el.dataset.type === 'ai')
            .map(el => {
                const userId = el.value;
                const messageElement = el.nextElementSibling.nextElementSibling.querySelector('textarea');
                const useTemplateElement = el.parentElement.querySelector(`[name="use_template_${userId}"]`);
                const messageContent = useTemplateElement.checked ? template : messageElement.value;
                return {
                    id: userId,
                    message: messageContent
                };
            });

        try {
            const response = await fetch('http://localhost:5000/send_messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    messages: selectedMessages
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
            } else {
                alert('Error occurred: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error in POST request:', error);
            alert('An error occurred while processing your request.');
        }
    };

    const handleSendConnections = async (event) => {
        event.preventDefault();
        const selectedConnections = Array.from(event.target.elements)
            .filter(el => el.type === 'checkbox' && el.checked)
            .map(el => ({
                id: el.value,
                name: el.getAttribute('data-name'),
                jobtitle: el.getAttribute('data-jobtitle'),
                profileLink: el.getAttribute('data-url')
            }));

        console.log(selectedConnections);

        try {
            const response = await fetch('http://localhost:5000/send_connection_requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    results: selectedConnections
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `connections.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove()
            } else {
                alert('Error occurred: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error in POST request:', error);
            alert('An error occurred while processing your request.');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">LinkedIn Search</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="business_idea" className="block text-lg font-medium mb-2">Search Keyword:</label>
                    <input
                        type="text"
                        id="business_idea"
                        value={businessIdea}
                        onChange={(e) => setBusinessIdea(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label htmlFor="template" className="block text-lg font-medium mb-2">Message Template:</label>
                    <textarea
                        id="template"
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                        rows="3"
                    />
                </div>
                <div className="flex flex-row gap-16 text-left">
                    <div className="relative">
                        <button
                            type="button"
                            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                            onClick={() => setCountryDropdownOpen(!isCountryDropdownOpen)}
                        >
                            Select Countries
                        </button>
                        <AnimatePresence>
                            {isCountryDropdownOpen && (
                                <motion.div
                                    className="absolute w-full bg-white border border-gray-300 rounded mt-2"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block p-2"><input type="checkbox" value="103644278" onChange={handleCheckboxChange(setSelectedCountries)} /> USA</label>
                                    <label className="block p-2"><input type="checkbox" value="101174742" onChange={handleCheckboxChange(setSelectedCountries)} /> Canada</label>
                                    <label className="block p-2"><input type="checkbox" value="101165590" onChange={handleCheckboxChange(setSelectedCountries)} /> UK</label>
                                    <label className="block p-2"><input type="checkbox" value="101282230" onChange={handleCheckboxChange(setSelectedCountries)} /> Germany</label>
                                    <label className="block p-2"><input type="checkbox" value="105015875" onChange={handleCheckboxChange(setSelectedCountries)} /> France</label>
                                    <label className="block p-2"><input type="checkbox" value="102713980" onChange={handleCheckboxChange(setSelectedCountries)} /> India</label>
                                    <label className="block p-2"><input type="checkbox" value="101452733" onChange={handleCheckboxChange(setSelectedCountries)} /> Australia</label>
                                    <label className="block p-2"><input type="checkbox" value="101355337" onChange={handleCheckboxChange(setSelectedCountries)} /> Japan</label>
                                    <label className="block p-2"><input type="checkbox" value="102890883" onChange={handleCheckboxChange(setSelectedCountries)} /> China</label>
                                    <label className="block p-2"><input type="checkbox" value="106057199" onChange={handleCheckboxChange(setSelectedCountries)} /> Brazil</label>
                                    <label className="block p-2"><input type="checkbox" value="105646813" onChange={handleCheckboxChange(setSelectedCountries)} /> Spain</label>
                                    <label className="block p-2"><input type="checkbox" value="102454443" onChange={handleCheckboxChange(setSelectedCountries)} /> Singapore</label>
                                    <label className="block p-2"><input type="checkbox" value="103350119" onChange={handleCheckboxChange(setSelectedCountries)} /> Italy</label>
                                    <label className="block p-2"><input type="checkbox" value="106693272" onChange={handleCheckboxChange(setSelectedCountries)} /> Switzerland</label>
                                    <label className="block p-2"><input type="checkbox" value="102890719" onChange={handleCheckboxChange(setSelectedCountries)} /> Netherlands</label>

                                    {/* Add more countries as needed */}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                            onClick={() => setIndustryDropdownOpen(!isIndustryDropdownOpen)}
                        >
                            Select Industries
                        </button>
                        <AnimatePresence>
                            {isIndustryDropdownOpen && (
                                <motion.div
                                    className="absolute w-full bg-white border border-gray-300 rounded mt-2"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block p-2"><input type="checkbox" value="47" onChange={handleCheckboxChange(setSelectedIndustries)} /> Accounting</label>
                                    <label className="block p-2"><input type="checkbox" value="901" onChange={handleCheckboxChange(setSelectedIndustries)} /> Agriculture, Construction, Mining Machinery Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="94" onChange={handleCheckboxChange(setSelectedIndustries)} /> Airlines/Aviation</label>
                                    <label className="block p-2"><input type="checkbox" value="120" onChange={handleCheckboxChange(setSelectedIndustries)} /> Alternative Dispute Resolution</label>
                                    <label className="block p-2"><input type="checkbox" value="125" onChange={handleCheckboxChange(setSelectedIndustries)} /> Alternative Medicine</label>
                                    <label className="block p-2"><input type="checkbox" value="3253" onChange={handleCheckboxChange(setSelectedIndustries)} /> Alternative Fuel Vehicle Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="481" onChange={handleCheckboxChange(setSelectedIndustries)} /> Animal Feed Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="127" onChange={handleCheckboxChange(setSelectedIndustries)} /> Animation</label>
                                    <label className="block p-2"><input type="checkbox" value="112" onChange={handleCheckboxChange(setSelectedIndustries)} /> Appliances, Electrical, and Electronics Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="19" onChange={handleCheckboxChange(setSelectedIndustries)} /> Apparel & Fashion</label>
                                    <label className="block p-2"><input type="checkbox" value="50" onChange={handleCheckboxChange(setSelectedIndustries)} /> Architecture & Planning</label>
                                    <label className="block p-2"><input type="checkbox" value="111" onChange={handleCheckboxChange(setSelectedIndustries)} /> Arts and Crafts</label>
                                    <label className="block p-2"><input type="checkbox" value="53" onChange={handleCheckboxChange(setSelectedIndustries)} /> Automotive</label>
                                    <label className="block p-2"><input type="checkbox" value="52" onChange={handleCheckboxChange(setSelectedIndustries)} /> Aviation & Aerospace</label>
                                    <label className="block p-2"><input type="checkbox" value="41" onChange={handleCheckboxChange(setSelectedIndustries)} /> Banking</label>
                                    <label className="block p-2"><input type="checkbox" value="529" onChange={handleCheckboxChange(setSelectedIndustries)} /> Baked Goods Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="142" onChange={handleCheckboxChange(setSelectedIndustries)} /> Beverage Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="12" onChange={handleCheckboxChange(setSelectedIndustries)} /> Biotechnology Research</label>
                                    <label className="block p-2"><input type="checkbox" value="11" onChange={handleCheckboxChange(setSelectedIndustries)} /> Business Consulting and Services</label>
                                    <label className="block p-2"><input type="checkbox" value="390" onChange={handleCheckboxChange(setSelectedIndustries)} /> Biomass Electric Power Generation</label>
                                    <label className="block p-2"><input type="checkbox" value="36" onChange={handleCheckboxChange(setSelectedIndustries)} /> Broadcast Media</label>
                                    <label className="block p-2"><input type="checkbox" value="49" onChange={handleCheckboxChange(setSelectedIndustries)} /> Building Materials</label>
                                    <label className="block p-2"><input type="checkbox" value="138" onChange={handleCheckboxChange(setSelectedIndustries)} /> Business Supplies and Equipment</label>
                                    <label className="block p-2"><input type="checkbox" value="129" onChange={handleCheckboxChange(setSelectedIndustries)} /> Capital Markets</label>
                                    <label className="block p-2"><input type="checkbox" value="54" onChange={handleCheckboxChange(setSelectedIndustries)} /> Chemical Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="690" onChange={handleCheckboxChange(setSelectedIndustries)} /> Chemical Raw Materials Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="90" onChange={handleCheckboxChange(setSelectedIndustries)} /> Civic & Social Organization</label>
                                    <label className="block p-2"><input type="checkbox" value="51" onChange={handleCheckboxChange(setSelectedIndustries)} /> Civil Engineering</label>
                                    <label className="block p-2"><input type="checkbox" value="128" onChange={handleCheckboxChange(setSelectedIndustries)} /> Commercial Real Estate</label>
                                    <label className="block p-2"><input type="checkbox" value="118" onChange={handleCheckboxChange(setSelectedIndustries)} /> Computer & Network Security</label>
                                    <label className="block p-2"><input type="checkbox" value="109" onChange={handleCheckboxChange(setSelectedIndustries)} /> Computer Games</label>
                                    <label className="block p-2"><input type="checkbox" value="3" onChange={handleCheckboxChange(setSelectedIndustries)} /> Computer Hardware</label>
                                    <label className="block p-2"><input type="checkbox" value="5" onChange={handleCheckboxChange(setSelectedIndustries)} /> Computer Networking</label>
                                    <label className="block p-2"><input type="checkbox" value="4" onChange={handleCheckboxChange(setSelectedIndustries)} /> Software Development</label>
                                    <label className="block p-2"><input type="checkbox" value="48" onChange={handleCheckboxChange(setSelectedIndustries)} /> Construction</label>
                                    <label className="block p-2"><input type="checkbox" value="24" onChange={handleCheckboxChange(setSelectedIndustries)} /> Consumer Electronics</label>
                                    <label className="block p-2"><input type="checkbox" value="25" onChange={handleCheckboxChange(setSelectedIndustries)} /> Consumer Goods</label>
                                    <label className="block p-2"><input type="checkbox" value="91" onChange={handleCheckboxChange(setSelectedIndustries)} /> Consumer Services</label>
                                    <label className="block p-2"><input type="checkbox" value="65" onChange={handleCheckboxChange(setSelectedIndustries)} /> Dairy Product Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="1" onChange={handleCheckboxChange(setSelectedIndustries)} /> Defense & Space</label>
                                    <label className="block p-2"><input type="checkbox" value="99" onChange={handleCheckboxChange(setSelectedIndustries)} /> Design</label>
                                    <label className="block p-2"><input type="checkbox" value="69" onChange={handleCheckboxChange(setSelectedIndustries)} /> Education Management</label>
                                    <label className="block p-2"><input type="checkbox" value="132" onChange={handleCheckboxChange(setSelectedIndustries)} /> E-Learning</label>
                                    <label className="block p-2"><input type="checkbox" value="112" onChange={handleCheckboxChange(setSelectedIndustries)} /> Electrical/Electronic Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="2253" onChange={handleCheckboxChange(setSelectedIndustries)} /> Dairy Product Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="34" onChange={handleCheckboxChange(setSelectedIndustries)} /> Food and Beverage Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="2423" onChange={handleCheckboxChange(setSelectedIndustries)} /> Fuel Cell Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="1266" onChange={handleCheckboxChange(setSelectedIndustries)} /> HVAC and Refrigeration Equipment Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="47" onChange={handleCheckboxChange(setSelectedIndustries)} /> Medical Equipment Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="56" onChange={handleCheckboxChange(setSelectedIndustries)} /> Motor Vehicle Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="66" onChange={handleCheckboxChange(setSelectedIndustries)} /> Personal Care Product Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="75" onChange={handleCheckboxChange(setSelectedIndustries)} /> Pharmaceutical Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="1445" onChange={handleCheckboxChange(setSelectedIndustries)} /> Renewable Energy Equipment Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="1444" onChange={handleCheckboxChange(setSelectedIndustries)} /> Renewable Energy Power Generation</label>
                                    <label className="block p-2"><input type="checkbox" value="1423" onChange={handleCheckboxChange(setSelectedIndustries)} /> Soap and Cleaning Product Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="1425" onChange={handleCheckboxChange(setSelectedIndustries)} /> Sugar and Confectionary Product Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="112" onChange={handleCheckboxChange(setSelectedIndustries)} /> Tobacco Manufacturing</label>
                                    <label className="block p-2"><input type="checkbox" value="1124" onChange={handleCheckboxChange(setSelectedIndustries)} /> Wineries</label>

                                    {/* Add more industries as needed */}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                            onClick={() => setConnectionDropdownOpen(!isConnectionDropdownOpen)}
                        >
                            Type of Connection
                        </button>
                        <AnimatePresence>
                            {isConnectionDropdownOpen && (
                                <motion.div
                                    className="absolute w-full bg-white border border-gray-300 rounded mt-2"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label className="block p-2"><input type="checkbox" value="F" onChange={handleCheckboxChange(setSelectedConnections)} /> 1st</label>
                                    <label className="block p-2"><input type="checkbox" value="S" onChange={handleCheckboxChange(setSelectedConnections)} /> 2nd</label>
                                    <label className="block p-2"><input type="checkbox" value="O" onChange={handleCheckboxChange(setSelectedConnections)} /> 3rd</label>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                        >
                            Search
                        </button>

                    </div>
                </div>
            </form>
            <div className="mt-8">
                {results.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Search Results:</h2>
                        <form onSubmit={handleSendMessages} className="mb-4">
                            <ul>
                                {results.map(({ name, id, jobtitle, navigationUrl, message }) => (
                                    <li key={id} className="mb-4 border p-4 rounded">
                                        <input
                                            type="checkbox"
                                            id={`user_${id}`}
                                            name={`user_${id}`}
                                            value={id}
                                            className="mr-2"
                                            data-type="ai"
                                        />
                                        <label htmlFor={`user_${id}`} className="font-medium">{name} - {jobtitle}</label>
                                        <div className="relative mt-2">
                                            <div className="p-2 text-gray-500">
                                                {message}
                                            </div>
                                            <textarea
                                                name={`message_${id}`}
                                                defaultValue={message}
                                                className="w-full p-2 border border-gray-300 rounded"
                                                rows="3"
                                            />
                                        </div>
                                        <label className="block mt-2">
                                            <input
                                                type="checkbox"
                                                name={`use_template_${id}`}
                                                className="mr-2"
                                                data-type="template"
                                            />
                                            Use Template
                                        </label>
                                        <a href={navigationUrl} target="_blank" rel="noopener noreferrer">
                                            <button type="button" className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                                                View Profile on LinkedIn
                                            </button>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="submit"
                                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                            >
                                Send Messages
                            </button>
                        </form>
                        <form onSubmit={handleSendConnections} className="mb-4">
                            <ul>
                                {results.map(({ id, name, jobtitle, navigationUrl }) => (
                                    <li key={id} className="mb-4 border p-4 rounded">
                                        <input type="checkbox" id={`connection_${id}`} name="user_ids" value={id} data-name={name}
                                            data-jobtitle={jobtitle} data-url={navigationUrl} className="mr-2" />
                                        <label htmlFor={`connection_${id}`} className="font-medium">Connect with user {name}-{jobtitle}</label>
                                        <a href={navigationUrl} target="_blank" rel="noopener noreferrer">
                                            <button type="button" className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                                                View Profile on LinkedIn
                                            </button>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="submit"
                                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                            >
                                Send Connection Requests
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkedInSearch;
