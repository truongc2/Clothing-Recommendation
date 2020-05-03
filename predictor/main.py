import flask 
from flask import request
import pickle 
import os 

app=flask.Flask(__name__)
filename = "../model/kmeans_model.pkl"
loaded_model = pickle.load(open(filename, 'rb'))
wv = gensim.models.KeyedVectors.load_word2vec_format(
    '../model/GoogleNews-vectors-negative300.bin', binary=True)

@app.route('/')
def infer(title):
  features = list(filter(lambda word: word in wv.vocab, title.split(' ')))
  v = list(map(lambda word: wv[word]))
  if len(v) < 1:
    raise Exception('Invalid title')
  avg_vector = np.mean(v, axis=0)
  return loaded_model.predict([avg_vector])


app.run(host='0.0.0.0', port=os.environ.get('PORT', 5000))


