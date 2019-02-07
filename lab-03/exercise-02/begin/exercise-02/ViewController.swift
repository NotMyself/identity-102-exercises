//
//  ViewController.swift
//  exercise-02
//
//  Created by Martin Walsh on 22/11/2018.
//  Copyright © 2018 Auth0. All rights reserved.
//

import UIKit
import Auth0

class ViewController: UIViewController {
    
    private var accessToken: String?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    @IBAction func actionLogin(_ sender: Any) {
        Auth0
            .webAuth()
            .scope("openid profile read:reports")
            .audience("https://expenses-api")
            .logging(enabled: true)
            .start { response in
                switch(response) {
                case .success(let result):
                    self.accessToken = result.accessToken
                    print("Authentication Success")
                    print("Access Token: \(result.accessToken ?? "No Access Token Found")")
                    print("ID Token: \(result.idToken ?? "No ID Token Found")")
                    print("Token Valid: \(isTokenValid(result.idToken!))")
                case .failure(let error):
                    print("Authentication Failed: \(error)")
                }
        }
    }
    
    @IBAction func actionAPI(_ sender: Any) {
        print("Call API")
        
        guard let accessToken = self.accessToken else {
            print("No Access Token found")
            return
        }
        
        let url = URL(string: "http://localhost:3001")! // Your protected API URL
        var request = URLRequest(url: url)
        
        
        request.addValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.log()
        
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            print(response ?? "No Response")
            if let data = data {
                print(String(data: data, encoding: .utf8) ?? "No Body")
            }

        }
        task.resume() // Execute the request

    }
    
}

