//
//  ViewController.swift
//  exercise-03
//
//  Created by Martin Walsh on 22/11/2018.
//  Copyright © 2018 Auth0. All rights reserved.
//

import UIKit
import Auth0

class ViewController: UIViewController {
    
    private var accessToken: String?
    private var refreshToken: String?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    @IBAction func actionLogin(_ sender: Any) {
        Auth0
            .webAuth()
            .scope("openid profile read:reports offline_access")
            .audience("https://expenses-api")
            .logging(enabled: true)
            .start { response in
                switch(response) {
                case .success(let result):
                    print("Authentication Success")
                    print("Access Token: \(result.accessToken ?? "No Access Token Found")")
                    print("ID Token: \(result.idToken ?? "No ID Token Found")")
                    print("Token Valid: \(isTokenValid(result.idToken!))")
                    self.accessToken = result.accessToken
                    self.refreshToken = result.refreshToken
                case .failure(let error):
                    print("Authentication Failed: \(error)")
                }
        }
    }
    
    @IBAction func actionAPI(_ sender: Any) {
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
        task.resume() // Exectue the request
    }
    
    @IBAction func actionRefresh(_ sender: Any) {
        print("Refresh Token")
        
        guard let refreshToken = self.refreshToken else {
            print("No Refresh Token found")
            return
        }
        
        
        Auth0
            .authentication()
            .logging(enabled: true)
            .renew(withRefreshToken: refreshToken)
            .start { response in
                switch(response) {
                case .success(let result):
                    print("Refresh Success")
                    print("New Access Token: \(result.accessToken ?? "No Access Token Found")")
                    self.accessToken = result.accessToken
                case .failure(let error):
                    print("Refresh Failed: \(error)")
                }
        }


    }
    
}

