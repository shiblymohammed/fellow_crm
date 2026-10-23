import React from 'react';
import Link from 'next/link';
import { BookOpen, Code, List, MapPin, Sparkles, Layers, ArrowRight } from 'lucide-react';

export default function TemplateDocsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
        <div className="flex items-center gap-3 bg-white/20 w-fit px-4 py-1.5 rounded-full mb-6">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-bold tracking-wide uppercase">Developer Guide</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold mb-4 leading-tight">
          Template Marketplace Docs
        </h1>
        <p className="text-indigo-100 text-lg max-w-2xl leading-relaxed">
          Learn how to build dynamic, powerful PDF templates for agencies using HTML, CSS, and Handlebars.
        </p>
      </div>

      {/* Quick Start */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          Core Concepts
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-lg mb-2">1. The Blueprint (HTML/CSS)</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Every template is just raw HTML and CSS. You have complete freedom to design anything. Use standard CSS within a <code>&lt;style&gt;</code> block in the head.
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-lg mb-2">2. Dynamic Data (Handlebars)</h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              We use Handlebars (<code>{`{{variable}}`}</code>) to inject agency-provided data into your HTML blueprint. You define what fields the agency fills out.
            </p>
          </div>
        </div>
      </section>

      {/* Field Types Guide */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Layers className="w-6 h-6 text-indigo-500" />
          Supported Field Types
        </h2>
        <p className="text-gray-500 mb-8">
          When creating a template, you define the fields the agency will fill. Here are the types you can use and how to render them.
        </p>

        <div className="space-y-8">
          
          {/* Simple Fields */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Basic Inputs</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li><strong className="text-indigo-600 dark:text-indigo-400">Text:</strong> Single line (e.g. Names, Titles)</li>
                <li><strong className="text-indigo-600 dark:text-indigo-400">Number:</strong> Numeric inputs (e.g. Price, Pax)</li>
                <li><strong className="text-indigo-600 dark:text-indigo-400">Long Text:</strong> Text areas (e.g. Notes, Descriptions)</li>
                <li><strong className="text-indigo-600 dark:text-indigo-400">Image URL:</strong> A pasted image link</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 font-mono text-sm shadow-inner">
              <p className="text-gray-400 mb-2">// How to use in HTML:</p>
              <p className="text-blue-400">&lt;h1&gt;<span className="text-green-400">{`{{trip_title}}`}</span>&lt;/h1&gt;</p>
              <p className="text-blue-400">&lt;p&gt;<span className="text-green-400">{`{{notes}}`}</span>&lt;/p&gt;</p>
              <p className="text-blue-400">&lt;img src="<span className="text-green-400">{`{{cover_image}}`}</span>" /&gt;</p>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Repeatable List */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <List className="w-5 h-5 text-emerald-500" />
                Repeatable Lists
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Perfect for Hotels, Inclusions, Pricing tables, etc. You define the <strong>Sub-fields</strong> (e.g. name, nights, price), and the agency can add infinite items to the list.
              </p>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-2">Helper Alert</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-300">Use <code>{`{{#each key}}`}</code> to loop through the items.</p>
              </div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 font-mono text-sm shadow-inner overflow-x-auto">
              <p className="text-gray-400 mb-2">// Assuming key is "hotels":</p>
              <pre className="text-blue-400 leading-relaxed">
{`<div class="hotel-list">
  `}
<span className="text-pink-400">{`{{#each hotels}}`}</span>
{`
    <div class="hotel-card">
      <img src="`}<span className="text-green-400">{`{{image_url}}`}</span>{`" />
      <h3>`}<span className="text-green-400">{`{{name}}`}</span>{`</h3>
      <p>`}<span className="text-green-400">{`{{nights}}`}</span>{` Nights</p>
    </div>
  `}
<span className="text-pink-400">{`{{/each}}`}</span>
{`
</div>`}
              </pre>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* Itinerary Days */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-violet-500" />
                Dynamic Itinerary Days
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                A built-in complex builder specifically for day-by-day travel itineraries. Agencies get a powerful UI to build days and activities.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 list-disc pl-5">
                <li><code>{`{{dayNumber}}`}</code> (1, 2, 3)</li>
                <li><code>{`{{zeroPad dayNumber}}`}</code> (01, 02, 03)</li>
                <li><code>{`{{title}}`}</code> and <code>{`{{description}}`}</code></li>
                <li>Nested <code>{`{{activities}}`}</code> array</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 font-mono text-sm shadow-inner overflow-x-auto">
              <pre className="text-blue-400 leading-relaxed">
<span className="text-pink-400">{`{{#each days}}`}</span>
{`
  <div class="day">
    <h2>Day `}<span className="text-green-400">{`{{zeroPad dayNumber}}`}</span>{` — `}<span className="text-green-400">{`{{title}}`}</span>{`</h2>
    <p>`}<span className="text-green-400">{`{{description}}`}</span>{`</p>
    
    <ul>
    `}<span className="text-pink-400">{`{{#each activities}}`}</span>{`
      <li>
        `}<span className="text-green-400">{`{{icon}}`}</span>{` <strong>`}<span className="text-green-400">{`{{time}}`}</span>{`</strong>
        — `}<span className="text-green-400">{`{{description}}`}</span>{`
      </li>
    `}<span className="text-pink-400">{`{{/each}}`}</span>{`
    </ul>
  </div>
`}
<span className="text-pink-400">{`{{/each}}`}</span>
              </pre>
            </div>
          </div>

        </div>
      </section>

      {/* Custom Helpers */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Code className="w-6 h-6 text-rose-500" />
          Handlebars Helpers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3 font-bold text-gray-900 dark:text-white rounded-tl-xl">Helper</th>
                <th className="px-4 py-3 font-bold text-gray-900 dark:text-white">Description</th>
                <th className="px-4 py-3 font-bold text-gray-900 dark:text-white rounded-tr-xl">Example Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr>
                <td className="px-4 py-3 font-mono text-pink-500">zeroPad</td>
                <td className="px-4 py-3">Pads a number with a leading zero</td>
                <td className="px-4 py-3 font-mono text-xs bg-gray-50 dark:bg-gray-950">{`{{zeroPad 5}}`} → 05</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-pink-500">eq</td>
                <td className="px-4 py-3">Checks if two values are equal</td>
                <td className="px-4 py-3 font-mono text-xs bg-gray-50 dark:bg-gray-950">{`{{#if (eq type 'hotel')}}...`}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-pink-500">gt</td>
                <td className="px-4 py-3">Checks if a &gt; b</td>
                <td className="px-4 py-3 font-mono text-xs bg-gray-50 dark:bg-gray-950">{`{{#if (gt price 0)}}...`}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <Link 
          href="/super-admin/templates/new"
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          Create New Template <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

    </div>
  );
}
