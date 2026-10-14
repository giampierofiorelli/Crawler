"""Fully synthetic, offline demo. No network, no real source data, no ranking."""
import json
from .html_recipes import proposal_inventory, qualify_proposal, approve_recipe, extract_reviewed

def page(name,hours):
    return f'<h1>{name}</h1><table><tr><th>Battery life</th><td>{hours} h</td></tr></table>'

def sample(name,hours,assessor):
    return {'url':f'https://maker.example/products/{name.lower().replace(" ", "-")}',
            'model':name,'html':page(name,hours),'labelled_by':assessor,
            'expected':{'battery_hours':{'value':hours,'unit':'h'}}}

def main():
    fields=[{'key':'battery_hours','unit':'h','review_id':'signed-category-field-approval'}]
    examples=[sample('Demo One',20,'human_labeller_A'),sample('Demo Two',30,'human_labeller_B')]
    inventory=proposal_inventory(examples,'maker.example','/products/',fields)
    # Demo ONLY: hard-coded simulation of a local model association. NOT Ollama.
    suggestion=[{'fieldKey':'battery_hours','candidateId':inventory['candidates'][0]['id']}]
    proposed=qualify_proposal(examples,'maker.example','/products/','headphones',fields,suggestion)
    approved=approve_recipe(proposed,'independent_reviewer_C','separate-human-review-receipt-001')
    later=extract_reviewed(approved,'https://maker.example/products/demo-three','Demo Three',page('Demo Three',27))
    print(json.dumps({'stage':proposed['status'],'review':approved['status'],
                      'new_product_values':later,'new_model_calls':0},indent=2))

if __name__=='__main__':main()
